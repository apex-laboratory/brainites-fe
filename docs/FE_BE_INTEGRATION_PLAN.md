# FE → BE Integration Plan

How to wire the currently mock-driven Brainite frontend into the backend API. The plan is layered: build the foundation once, then migrate features one at a time — each feature swap is a small, shippable PR.

## Backend reality check

The backend is **FastAPI (Python)**. `API_DOCUMENTATION.md` predates that decision (it describes a Node/Express shape and uses the old "Hephaestou" name) — treat it as the *contract wishlist* (routes, resources, flows), not gospel. Three things to confirm against the real FastAPI app before Phase 1 is finalized, because each has a FastAPI-flavored default that differs from the doc:

1. **Error shape.** FastAPI's built-in validation error is `422` with `{"detail": [{"loc": [...], "msg": "...", "type": "..."}]}`, and `HTTPException` produces `{"detail": "..."}` — neither matches the doc's `{ "error": { "code", "message", "details" } }` envelope. Either the BE adds an exception handler that emits the envelope (preferred), or `toApiError` in the client must parse both shapes. Decide once, early.
2. **Field casing.** Pydantic models default to `snake_case` JSON; the doc says `camelCase`. Either the BE sets camelCase aliases (`alias_generator=to_camel`), or the FE zod schemas normalize with a `.transform()` at the boundary. Pick one — do not mix.
3. **Success envelope.** Confirm the BE actually wraps responses in `{ "data": ..., "meta": ... }`. FastAPI returns the model bare by default. The client's unwrap line is the only place this matters.

Bonus: FastAPI serves `openapi.json` (and `/docs`) for free. Use it as the source of truth when writing the zod schemas in Phase 3 — or consider generating them (`openapi-zod-client`) once the BE stabilizes; hand-written schemas are fine for the MVP.

## Current state

- Vite + React 18 + TS, feature folders under `src/features/*` with `components / hooks / pages / types / data`.
- All data comes from fixtures in each feature's `data/` folder; hooks like `useReviews` mutate local state.
- `AuthProvider` is a static flow-stage machine persisted to localStorage — no real tokens.
- `zod` and `sonner` are already installed. No data-fetching library, no axios.

## Target architecture

```txt
src/
  lib/
    api/
      client.ts        # fetch wrapper: base URL, auth header, envelope unwrap, timeout
      errors.ts        # ApiError taxonomy
      tokens.ts        # access/refresh token storage + refresh queue
      query-client.ts  # TanStack QueryClient with global defaults
  features/<feature>/
    api/               # NEW per feature: endpoint fns + zod schemas
      <feature>.api.ts
      <feature>.schemas.ts
    hooks/             # existing hooks become useQuery/useMutation wrappers
    data/              # deleted once the feature is migrated
```

Rules of thumb:

- **Components never call `fetch` and never `try/catch` network code.** They render query state (`isPending / isError / data`).
- **One place converts HTTP failures into typed errors** (the client). Everything above it deals in `ApiError`, not raw `Response`.
- **`try/catch` lives in exactly two places:** inside the client (to normalize failures) and in mutation event handlers when you need custom rollback. Queries surface errors through state, not exceptions.
- **Validate at the boundary.** Every endpoint response is parsed with a zod schema so a backend drift becomes a loud, located error instead of `undefined is not a function` three components deep.

## Phase 0 — Dependencies & env

```bash
npm i @tanstack/react-query
npm i -D @tanstack/react-query-devtools
```

`.env.development`:

```txt
VITE_API_URL=http://localhost:4000/api/v1
```

Extend `src/vite-env.d.ts` with an `ImportMetaEnv` interface so `import.meta.env.VITE_API_URL` is typed.

`.gitignore` already ignores `*.local`, so machine-specific overrides go in `.env.local`. `.env.development` (just a localhost URL, no secrets) is safe to commit. Note a plain `.env` would **not** be ignored today — don't create one with secrets.

## Phase 1 — API foundation (`src/lib/api/`)

### 1a. Error taxonomy — `errors.ts`

One class, discriminated by `code`, mirroring the backend envelope:

```ts
export type ApiErrorCode =
  | "validation_error" | "unauthorized" | "forbidden" | "not_found"
  | "conflict" | "rate_limited" | "server_error" | "network_error" | "timeout";

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status: number | null,       // null = never reached server
    public readonly details?: { path: string; message: string }[],
    public readonly requestId?: string,
  ) { super(message); this.name = "ApiError"; }

  get isRetryable() { return this.code === "network_error" || this.code === "timeout" || this.status === 500; }
}
```

### 1b. Token store — `tokens.ts`

- Holds `accessToken` in memory, `refreshToken` in localStorage (MVP tradeoff; move to httpOnly cookie later if the backend supports it).
- `refreshTokens()` is **single-flight**: concurrent 401s share one in-flight refresh promise instead of stampeding `/auth/refresh`.
- On refresh failure: clear tokens and emit a `session-expired` event the `AuthProvider` listens to (redirect to `/auth` + toast).

### 1c. HTTP client — `client.ts`

A thin typed `fetch` wrapper. This is the **only** `try/catch` around network I/O in the app:

```ts
export async function api<T>(path: string, schema: z.ZodType<T>, init?: ApiInit): Promise<T> {
  const res = await doFetch(path, init);          // throws ApiError("network_error"/"timeout")

  if (res.status === 401 && !init?.skipAuthRetry) {
    await refreshTokens();                        // single-flight
    return api(path, schema, { ...init, skipAuthRetry: true });
  }
  if (!res.ok) throw await toApiError(res);       // parses { error: { code, message, details } }

  if (res.status === 204) return schema.parse(undefined);
  const body = await res.json();
  return schema.parse(body.data);                 // unwrap envelope + validate
}
```

Details worth getting right:

- `doFetch` wraps `fetch` in try/catch with an `AbortSignal.timeout(15_000)`; a thrown `TypeError` → `ApiError("network_error")`, an abort → `ApiError("timeout")`.
- `toApiError` itself try/catches the `res.json()` — a 502 HTML page from a proxy must still become a clean `ApiError("server_error")`. Per the reality check above, it should tolerate both the envelope shape and FastAPI's raw `{"detail": ...}` until the BE standardizes.
- Attach `Authorization: Bearer <accessToken>` automatically; `skipAuth` option for `/auth/*` calls.
- Convenience verbs: `api.get / api.post / api.patch / api.delete`.
- A `zod.parse` failure should throw a dev-readable error naming the endpoint (wrap in `schema.safeParse` and log `result.error.flatten()` before throwing).

### 1d. Query client — `query-client.ts`

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, err) => err instanceof ApiError && err.isRetryable && count < 2,
    },
    mutations: {
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
    },
  },
});
```

Global mutation `onError` gives every mutation a sane toast for free; individual mutations override it when they need rollback or field-level messages (map `err.details` onto form fields for `validation_error`).

Mount `QueryClientProvider` (+ devtools in dev) in `src/app/App.tsx`.

## Phase 2 — Real auth

Replace the static `AuthProvider` internals, keep its public surface so pages don't churn:

- `signin(email)` → `POST /auth/signin`, store tokens, cache `user` + `workspace`, navigate per `nextStep`.
- `signup(email)` → `POST /auth/signup` → onboarding.
- `logout()` → `POST /auth/logout` (fire-and-forget with a local `catch` — logout must succeed locally even if the network is down), clear tokens, navigate.
- Expose `workspaceId` from context — every data endpoint needs it, so provide a `useWorkspaceId()` hook that throws if missing (route guard guarantees it).
- Route guard: redirect to `/auth` when there's no session; keep the existing `FlowStage` idea only for onboarding progress.

## Phase 3 — Feature migration (one PR each)

Per-feature recipe, using **reviews** as the template:

1. `features/reviews/api/reviews.schemas.ts` — zod schemas for `Review` etc. Derive the TS types via `z.infer` and delete the hand-written duplicates in `types/`.
2. `features/reviews/api/reviews.api.ts`:
   ```ts
   export const reviewsApi = {
     list: (wid: string) => api.get(`/workspaces/${wid}/reviews`, ReviewListSchema),
     resolve: (wid: string, id: string, verdict: "approve" | "reject") =>
       api.post(`/workspaces/${wid}/reviews/${id}/resolve`, ResolveSchema, { body: { verdict } }),
   };
   ```
3. Rewrite `useReviews` on `useQuery` + `useMutation` with an **optimistic update** (remove from queue in `onMutate`, snapshot + rollback in `onError`, invalidate in `onSettled`) — this preserves today's instant-feeling UX.
4. Delete `features/reviews/data/`.

Query key convention (stick to it — it's what makes invalidation predictable):

```ts
["reviews", workspaceId]              // lists
["decisions", workspaceId, filters]   // filtered lists
["decisions", workspaceId, "detail", decisionId]
```

Migration order (dependency + risk order):

| # | Feature | Endpoints | Notes |
| --- | --- | --- | --- |
| 1 | Auth | `/auth/*` | Unblocks everything |
| 2 | Reviews | `/reviews`, `/reviews/:id/resolve` | Smallest surface; establishes the pattern incl. optimistic mutation |
| 3 | Decisions | `/decisions`, `/decisions/:id`, `/decisions/:id/pin` | Adds filters/pagination via query-key params |
| 4 | Sources | `/sources`, channels, scope, disconnect | OAuth connect flow: open `authorizationUrl`, handle callback route |
| 5 | Dashboard | `/overview`, `/activity` | Read-only, several queries per page |
| 6 | Skills | `/skills`, `/skills/:id`, create/invoke | |
| 7 | Brain chat | `/brain/query`, conversations | Longest request; needs per-message pending state (consider streaming later) |
| 8 | Onboarding | workspace create, source connect, brain builds | Build status = `useQuery` with `refetchInterval` polling until terminal state |
| 9 | Settings | settings, members, api-keys, usage | API key shown once on create — handle in dialog state, never cache it |

## Phase 4 — UI states

- Add `QueryState`-style shared components: a skeleton/`isPending` variant per list, and an inline error card with the `ApiError.message` + a **Retry** button (`refetch`). No blank screens, no infinite spinners.
- One `ErrorBoundary` at the layout level for render-time crashes (not network errors — those are handled by query state).
- Keep `sonner` toasts for mutation outcomes only; query (read) errors render inline where the data would be.

## Verification checklist (per migrated feature)

- Happy path against local backend (`VITE_API_URL=http://localhost:4000/api/v1`).
- Kill the backend mid-session → inline error + retry works, no console crash.
- Expired access token → single silent refresh, request retried once, no double-refresh in the network tab.
- Invalid refresh token → redirected to `/auth` with a toast.
- 422 on a form → field-level messages from `error.details`.
- `npm run build` passes (types come from `z.infer`, so schema drift fails the build where it's used).
