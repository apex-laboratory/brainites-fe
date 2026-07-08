# Auth Integration — Open Questions for the Backend

Raised while wiring the **auth flow** (`INTEGRATIONS.md` §Auth) into the frontend.
Each item is something the FE either had to assume or work around; confirming or
fixing them on the BE side lets us delete FE guesswork.

Ordered by risk. **P0** items can cause auth to silently 422/fail today.

---

## P0 — Request-body field casing on `/auth/refresh` and `/auth/logout`

`INTEGRATIONS.md` has a global note that request bodies require **snake_case**
with `extra="forbid"` (unknown keys → `422`). But the Auth examples show
**camelCase** request bodies:

```jsonc
// docs show:
POST /auth/refresh   { "refreshToken": "eyJ…" }
POST /auth/logout    { "refreshToken": "eyJ…" }
```

**Which is correct — `refreshToken` or `refresh_token`?** If these endpoints
share the `extra="forbid"` snake_case convention, then sending `refreshToken`
(as the doc literally prints) will `422`.

- The FE currently sends **`{ refreshToken }`** (camelCase, matching the doc's
  JSON) for both refresh and logout, plus the httpOnly cookie.
- If the real contract is `refresh_token`, tell us and we'll switch the one line
  in `src/lib/api/tokens.ts` / `src/features/auth/api/auth.api.ts`.

Same question, lower stakes, for `{ code, state }` on the OAuth callback and
`{ email }` on signup/signin — those have no camelCase ambiguity, but please
confirm they are **not** wrapped/renamed.

---

## P0 — CORS + credentials for the refresh cookie

The FE sends `credentials: "include"` on every request so the httpOnly refresh
cookie (scoped to `/api/v1/auth`) is sent/received. For that to work
cross-origin (dev is `http://localhost:5173` → `http://localhost:4000`), the BE
must:

1. Set `Access-Control-Allow-Origin` to the **exact** FE origin (not `*` — `*`
   is illegal with credentials).
2. Set `Access-Control-Allow-Credentials: true`.
3. Issue the refresh cookie as `SameSite=None; Secure` for cross-site dev, **or**
   we agree to run FE+BE on the same origin (proxy) so `SameSite=Strict` works.

**Please confirm the allowed origins list and the cookie's `SameSite`/`Secure`
attributes in each environment (dev / prod).** Without (1)+(2) the browser drops
the cookie and every refresh falls back to the localStorage token.

Also: if you want us to read `x-request-id` from responses for support tickets,
add it to `Access-Control-Expose-Headers`.

---

## P1 — No session-restore endpoint (`GET /auth/me`)

On a full page reload the FE only has the **refresh token** (localStorage /
cookie). `POST /auth/refresh` returns **only** `{ accessToken, refreshToken }` —
no `user` / `workspace`. So to render the shell after reload we currently
**persist a display snapshot of `user` + `workspace` in localStorage** and trust
it until the next authenticated call.

That's an MVP compromise we'd like to remove. **Please add one of:**

- **(preferred)** `GET /auth/me` → `{ user, workspace }` (any valid access
  token), which we'd call once after the silent refresh on load; **or**
- include `user` + `workspace` in the `POST /auth/refresh` response body.

Either lets us rehydrate identity authoritatively instead of trusting client
storage.

---

## P1 — OAuth SSO redirect URI + callback query params

FE flow implemented: `GET /auth/oauth/{provider}/start` → redirect browser to
`authorizationUrl` → provider redirects back → FE reads `code`+`state` → `POST
/auth/oauth/{provider}/callback`.

We built the redirect landing route at:

```
{FRONTEND_URL}/auth/callback/{provider}
```

**Please confirm:**

1. The `redirect_uri` registered with Google/GitHub (and encoded into `state`)
   points at exactly `{FRONTEND_URL}/auth/callback/{provider}`. If it points
   somewhere else (e.g. a BE route), tell us the real landing path.
2. The provider returns `?code=…&state=…` on success and `?error=…` on decline
   (we handle `error=access_denied` specially). Confirm the param **names**.
3. `provider` path values are exactly `google` and `github` (lowercase).

---

## P2 — Passwordless auth: confirm the model

The FE is now **passwordless** — the sign-in screen collects only an email and
`POST /auth/signup|signin` sends `{ email }`. We removed the password field,
"Forgot password?", and "Remember me" to match the shipped contract.

Two confirmations:

1. **Is email ownership verified?** The docs show signup/signin returning
   `accessToken`/`refreshToken` **immediately** for just an email — i.e. anyone
   can mint a session for any email with no magic-link / OTP step. Is that
   intended for the MVP, or is a verification step coming that will change the
   response (e.g. `202` "check your email" instead of a token pair)? If the
   latter, the FE needs a "check your inbox" state — flag it now.
2. Confirm `nextStep` is only ever `"onboarding" | "dashboard"` (the FE enum). If
   a `"verify_email"` (or similar) value is coming, we'll add handling.

---

## P2 — Error envelope shape (confirm, don't change midway)

The FE client tolerates **both** shapes today, but please pick one and tell us
which is canonical so we can tighten:

- Preferred: `{ "error": { "code", "message", "details" }, "meta": { requestId } }`
  with `details` as `[{ "path": "...", "message": "..." }]` for `validation_error`.
- FastAPI default: `{ "detail": "..." }` or `{ "detail": [{ loc, msg, type }] }`.

If you emit the `error` envelope, confirm the `code` strings match our taxonomy
(`validation_error | unauthorized | forbidden | not_found | conflict |
rate_limited | server_error`) so field-level form errors map cleanly.

---

## Dependency note (no BE action) — dashboard/workspace gating

`/dashboard/*` is currently gated on **authentication only**. To gate on an
active **workspace** (the `RequireWorkspace` guard is already written but not
mounted), onboarding must call `POST /workspaces` and consume the returned
`{ workspace, accessToken }`. That's the next integration (Workspaces/onboarding),
tracked separately — noting here so the auth PR's looser gate isn't mistaken for
an oversight.

---

## Summary of FE assumptions currently in code

| Area | FE assumption | File |
| --- | --- | --- |
| Refresh/logout body key | `{ refreshToken }` (camelCase) | `lib/api/tokens.ts`, `features/auth/api/auth.api.ts` |
| Refresh response | `{ data: { accessToken, refreshToken } }` | `lib/api/tokens.ts` |
| Session shape | `{ user, workspace, accessToken, refreshToken, nextStep }` | `features/auth/api/auth.schemas.ts` |
| Identity on reload | trust localStorage snapshot after silent refresh | `app/providers/AuthProvider.tsx` |
| OAuth landing | `{FRONTEND_URL}/auth/callback/{provider}?code&state` | `features/auth/pages/OAuthCallbackPage.tsx` |
| Error parsing | both `{ error }` and `{ detail }` shapes | `lib/api/client.ts` |
| Cookies | `credentials: "include"` on all requests | `lib/api/client.ts` |
