# Brief: implement the Onboarding Sweep flow

## Background

Connecting a source (Notion/GitHub/Drive/Gmail/Slack/Jira/Zendesk) deliberately does **not** ingest any historical data. The backend only registers the connection and, for Google sources, opens a push channel. Historical backfill happens exclusively in the onboarding sweep, which the frontend must trigger explicitly.

Right now nothing calls it, so freshly connected sources sit empty until a webhook happens to fire. GitHub in particular never ingests anything at all. This flow closes that gap.

---

# Base URL and auth

- Base: `/api/v1` (dev: `http://localhost:4000/api/v1` — confirm the port with backend, it has moved)
- Auth: `Authorization: Bearer <access JWT>`
- All sweep and source routes require role `admin`.
- A viewer/editor token gets `403`.
- Don't show the sweep UI to non-admins.

---

# Response envelopes

Every success:

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_...",
    "timestamp": "2026-07-26T11:22:59Z"
  }
}
```

Every error:

```json
{
  "error": {
    "code": "not_found",
    "message": "...",
    "details": null
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

Read payloads from `data`, never the root.

Surface `meta.requestId` in error toasts—it's how backend traces a report.

---

# Endpoints

## 1. GET /sources — what's connected

Returns `data: SourceConnectionOut[]`.

| Field             | Type                                                                                |
| ----------------- | ----------------------------------------------------------------------------------- |
| id                | string (`src_…`)                                                                    |
| provider          | `notion` \| `github` \| `google_drive` \| `gmail` \| `slack` \| `jira` \| `zendesk` |
| name              | string                                                                              |
| status            | string (`connected`, `error`, …)                                                    |
| syncStatus        | string                                                                              |
| externalAccountId | string \| null                                                                      |
| lastSyncedAt      | ISO 8601 \| null                                                                    |
| health            | number \| null                                                                      |
| createdAt         | ISO 8601                                                                            |

Use this to:

- render the pre-sweep checklist
- disable **Build my brain** when nothing is connected

---

## 2. POST /sources/{provider}/authorize — start a connection

Body is optional.

Only Zendesk requires:

```json
{
  "subdomain": "acme"
}
```

Returns:

```
202 Accepted
```

```json
{
  "data": {
    "authorizeUrl": "https://..."
  }
}
```

Redirect the browser to `authorizeUrl`.

The provider redirects back to a backend callback, which then redirects to:

```
{FRONTEND_URL}/settings/sources?connected={provider}
```

Handle the `connected` query parameter to show a success state.

Possible errors:

- `501 not_configured`
  - provider credentials aren't configured on this deployment
  - show **Not available**, not Retry

- `502 connector_authorization_failed`
  - provider rejected authorization
  - backend message explains why

---

## 3. POST /sweeps — start the onboarding sweep ⭐

No request body.

This endpoint is idempotent.

Possible responses:

### 202 Accepted

A brand new sweep was created.

### 200 OK

A sweep was already running.

Treat **both** as success.

Both return the same `SweepOut` shape.

Store:

```
data.id
```

---

## 4. GET /sweeps/{sweepId} — poll progress

Returns:

```
200 OK
```

with `SweepOut`.

Unknown or malformed IDs return:

```
404 not_found
```

### SweepOut

```json
{
  "id": "0f2c…-uuid",
  "status": "pending",
  "progress": {
    "notion": {
      "status": "completed",
      "inserted": 42
    },
    "github": {
      "status": "running",
      "inserted": 0
    },
    "google_drive": {
      "status": "failed",
      "inserted": 3,
      "error": "sync_failed"
    }
  },
  "skillsCreated": 0,
  "skillsQueued": 0,
  "startedAt": "2026-07-26T11:22:59Z",
  "completedAt": null
}
```

Sweep status:

```
pending
→ running
→ completed | failed
```

Per-provider status:

```
running
completed
failed
```

`progress` is `{}` while pending.

`error` only exists on failed providers.

---

## 5. GET /sweeps/active — recover an in-flight sweep

Returns one of:

### Active sweep exists

```json
{
  "data": {
    ...SweepOut
  }
}
```

### No active sweep

```json
{
  "data": null
}
```

Call this endpoint every time the onboarding page loads.

- If `data` is non-null:
  - immediately navigate to the **Building your brain…** screen
  - use `data.id`
  - continue polling `GET /sweeps/{id}`

- If `data` is null:
  - show the normal Sources screen

No client-side persistence of the sweep id is needed.

---

# The flow to build

### 0. Page load

Call:

```
GET /sweeps/active
```

If an active sweep exists:

- jump directly to the **Building your brain…** screen
- continue polling

Otherwise:

- render the normal Sources screen

---

### 1. Sources screen

Call:

```
GET /sources
```

User connects providers via:

```
POST /sources/{provider}/authorize
```

---

### 2. Build my brain

Enable the CTA once **at least one** source is connected.

On click:

```
POST /sweeps
```

Store:

```
data.id
```

---

### 3. Building your brain…

Poll:

```
GET /sweeps/{id}
```

every **2–3 seconds**.

Render one row per provider in `progress`.

Show:

- spinner while running
- checkmark when completed
- warning icon on failure
- live inserted count

There is currently no rate limit, but don't poll faster than once per second.

Stop polling when:

- the sweep is terminal
- extraction counts have settled

Also stop after roughly **15 minutes** and show:

> Still working. Check back later.

Large workspaces can legitimately exceed your timeout.

---

### 4. Done state

See the timing caveat below before deciding what "done" means.

---

# Four things that will bite you

## 1. completed does NOT mean skills are ready

`status = completed` only means ingestion finished.

Immediately afterward the backend queues a separate batched extraction phase.

Therefore:

```
skillsCreated
skillsQueued
```

start at `0` and continue increasing after the sweep itself has completed.

If you immediately navigate away on `completed`, users land on an empty review queue and assume something broke.

Either:

- keep polling until the counts stop changing

or

- clearly show:

> Ingesting complete — extracting knowledge…

---

## 2. completed can still contain failures

The overall sweep only becomes `failed` if **every attempted source failed**.

Example:

```
Notion ✓
Drive ✓
Slack ✓
GitHub ✗
```

still results in:

```
status = completed
```

Always inspect every provider inside `progress`.

Show failures individually.

Example:

> Drive couldn't be synced. Please reconnect it.

Do not hide successful providers because one failed.

---

## 3. progress is keyed by provider, not connection

Progress is grouped like:

```
google_drive
github
gmail
```

—not by connected account.

Two connected Google Drive accounts become one entry with summed counts.

Don't attempt to map progress rows one-to-one with `/sources`.

---

## 4. No lookback or source-selection parameters

`POST /sweeps` accepts **no body**.

The backend decides connector defaults.

Example:

- Drive backfills the last 90 days
- capped at 200 files

If product designs include:

- lookback picker
- channel selector
- per-source selection

those require backend work first.

Don't build UI whose values are silently ignored.

Confirm with backend before designing those controls.

---

# Acceptance criteria

- Non-admin users never see the sweep CTA.
- A `403` renders a clear permissions message.
- `POST /sweeps` returning `200` vs `202` is indistinguishable to users.
- Reloading the page automatically resumes an active sweep by calling `GET /sweeps/active`.
- If an active sweep exists, the UI jumps straight back to **Building your brain…** and resumes polling.
- If there is no active sweep, the normal Sources screen is shown.
- No client-side persistence of the sweep id is required.
- Per-source failures are visible without hiding successful sources.
- The done state isn't shown until extraction counts have settled.
