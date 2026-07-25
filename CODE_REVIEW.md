# Code Review — `be/integrations` vs `main`

**Date:** 2026-07-24
**Scope:** Full branch diff (157 files, ~7.4k insertions) — backend wiring for auth/tokens, sources, reviews, skills, brain chat, and dashboard.
**Method:** 8 finder angles produced 35 raw candidates; after dedup, 17 correctness candidates went through verification (8 agent verifiers plus inline verification against fully-read sources). 10 confirmed findings survived, ranked below from most to least severe. 2 candidates were refuted during verification.

---

## Confirmed findings

### 1. Strict provider enum can blank the entire Sources surface

**File:** `src/features/sources/api/sources.schemas.ts:21` — *correctness*

`SourceProviderSchema` is a strict `z.enum` with no `.catch()` or row-level filtering, so one unrecognized provider in `GET /sources` fails the whole list parse and errors every consumer.

**Failure scenario:** Backend adds a new integration (e.g. `confluence`) and returns it alongside healthy rows → `SourceListSchema` safeParse fails → `client.ts:208-218` throws `ApiError "Unexpected response shape from /sources"` → SourcesPage, onboarding StepConnect/StepConfigure, and AddSourceDialog all show error states and every connected source becomes invisible.

**Note:** The fix needs row-level filtering (`useSources.ts:64` indexes `SOURCES[provider]`), not just `.catch()`.

### 2. Transient refresh failures evict a live session

**File:** `src/lib/api/tokens.ts:130` — *correctness*

`doRefresh` treats any non-2xx from `/auth/refresh` — including transient 502/503/429 — as a dead session: `clearTokens` + `emitSessionExpired` force-log the user out.

**Failure scenario:** Access token expires mid-session and the single `POST /auth/refresh` hits a proxy 502 during a backend deploy → `if (!res.ok)` runs `clearTokens()` + `emitSessionExpired()` → query cache wiped, "Your session expired" toast, redirect to `/auth`, despite the refresh cookie still being valid. This contradicts the file's own design note that transient failures must not evict a live session; only 401/403 should.

### 3. StrictMode rehydrate hang — auth stuck on "loading" forever

**File:** `src/app/providers/AuthProvider.tsx:142` — *correctness*

The rehydrate effect combines a run-once `didHydrate` ref with an `active` cleanup flag; under React StrictMode (on in `src/main.tsx`) the only in-flight rehydrate has `active=false`, so `setStatus` never runs and status is stuck on `loading` forever.

**Failure scenario:** Dev server: signed-in user reloads. Effect run #1 sets `didHydrate=true` and starts `refreshTokens().then(authApi.me)`; StrictMode cleanup sets `active=false`; run #2 early-returns on `didHydrate`. Both `.then` and `.catch` hit `if (!active) return` → status stays `loading` and RequireAuth/RequireGuest render the SessionLoading spinner indefinitely on every dev reload with a session.

### 4. Onboarding remounts silently mint extra live API keys

**File:** `src/features/onboarding/hooks/useIntegration.ts:62` — *correctness*

The "mint exactly once" guard is a per-mount `useRef`, so every remount of the integrate step silently mints another live agent API key via `POST /api-keys`.

**Failure scenario:** User reaches StepIntegrate, clicks Back, then Next again (×3) → component remounts, `minted` ref resets, `mint.mutate()` fires each time → multiple live "Onboarding agent key" credentials accumulate server-side, never revoked, and snippets the user already copied reference a different key than the one now shown.

### 5. Failing syncs still show healthy green "live" dots

**File:** `src/features/dashboard/pages/OverviewPage.tsx:90` — *correctness*

Overview sync indicators hardcode `tone="live"` green pulse (header line 90, per-source rows line 267) while `useOverview` drops `sync.status`/`syncStatus`, so a failing sync still shows healthy green dots.

**Failure scenario:** `GET /workspaces/{id}/overview` returns `sync = { status: 'error', label: 'Sync failing on 2 sources' }` (`SyncStateSchema` allows `'error'`) → the page renders a green pulsing "live" dot next to that label, and each broken source in Source health also gets a green dot — `useOverview.ts:131` maps only `sync.label` and `mapSourceHealth` ignores `syncStatus` entirely.

### 6. Double-click on Approve/Reject fires the resolve mutation twice

**File:** `src/features/reviews/components/ReviewCard.tsx:42` — *correctness*

Approve/Reject buttons stay enabled during the 280ms exit animation (no `disabled`/exit guard), so a double-click fires the resolve mutation twice for the same review.

**Failure scenario:** User double-clicks Approve → `dismiss()` schedules two timeouts, `onResolve` runs twice → second `POST /reviews/{id}/approve` fails on the already-resolved review → `useReviews` `onError` (lines 113-116) rolls back the optimistic removal and toasts "Couldn't record that review" even though the approval succeeded.

### 7. Dashboard mappers silently drop rows with null sourceProvider

**File:** `src/features/dashboard/hooks/useOverview.ts:96` — *correctness*

`mapActivity`/`mapDecisions`/`mapSourceHealth`/`mapReviews` silently drop every row whose `sourceProvider` is null, even though the dashboard schemas explicitly allow null.

**Failure scenario:** Backend emits activity events or decisions with `sourceProvider: null` (nullable at `dashboard.schemas.ts:37/47/78`) → `if (!src) return []` discards them → Overview's Activity / Recent decisions / Review preview sections render empty or incomplete while DecisionsPage shows the same records via its null-source fallback tile.

### 8. "Today's review progress" is computed from lifetime stats

**File:** `src/features/reviews/hooks/useReviews.ts:79` — *correctness*

The "Today's review progress" meter is computed from lifetime `/reviews/stats` (approved + rejected over all time), so it sits near 100% regardless of the session's actual triage.

**Failure scenario:** Workspace with stats `{pending: 10, approved: 300, rejected: 50}` → ReviewsPage header reads "Today's review progress 350/360" (~97% full meter) before the admin has reviewed anything today, contradicting the "10 pending" badge; approving all 10 barely moves it. `ReviewStats` has no time window, so the "Today's" label is false.

### 9. 30-day call count hidden when the 7-day sparkline is quiet

**File:** `src/features/skills/hooks/useSkillsSearch.ts:43` — *correctness*

`mapMetrics` gates the 30-day call count on the 7-point daily sparkline having a nonzero value, hiding real usage for any skill quiet in the last week.

**Failure scenario:** A skill with `calls30d=500` (all between day 8 and day 30) has a 7-point `callSeries` of zeros → `hasUsage=false` → `calls` and `spark` set to `undefined` → SkillsTable renders the em-dash placeholder as if the skill were unused, even though the schema (`skills.schemas.ts:42`) documents `callSeries` as a 7-day window distinct from the 30-day count.

### 10. Chat page still shows the "Riverline" fixture brand to every tenant

**File:** `src/features/brain-chat/pages/BrainChatPage.tsx:66` — *correctness*

The chat page still renders the static fixture `BRAND.workspace` ("Riverline") in the header (line 66) and composer placeholder (line 124) while the greeting uses the live workspace name.

**Failure scenario:** Tenant "Acme Corp" opens `/dashboard/chat` → greeting bubble says "I'm Acme Corp's brain" (`useBrainChat.ts:85` uses live identity) but the header reads "Riverline brain" and the placeholder says "Ask Riverline's brain anything…" — another company's fixture name shown to every real tenant.

---

## Refuted candidates

- **Confidence units** — suspected 0–1 vs percentage mismatch; refuted: the contract documents confidence as 0–100 integers.
- **Onboarding sweep hang** — suspected StrictMode hang in StepLearning; refuted: a "Skip for now" escape hatch exists.

## Cut by the output cap (unverified, PLAUSIBLE)

Five auth-layer candidates were plausible but outranked by the confirmed findings above and not fully verified:

- Unguarded `res.json()` in `doRefresh`
- Spurious session-expired toast on cold load
- Snapshot-AND-marker rehydrate gate
- Abort-mapped-to-timeout
- Logout race

Cleanup-level items (also cut): `asSourceId` duplicated in four hooks, duplicate blob-export fetch path, redundant mirrored state, and other minor simplifications.
