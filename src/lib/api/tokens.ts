/**
 * Token store + refresh coordination.
 *
 * - The **access token** lives in memory only (never persisted) — it is short
 *   lived (~15 min) and re-minted on reload via the refresh cookie.
 * - The **refresh token** is NOT stored by JS at all. The backend holds it in an
 *   httpOnly cookie scoped to `/api/v1/auth` that JS can't read; `/auth/refresh`
 *   and `/auth/logout` carry it automatically via `credentials: "include"` with
 *   an empty request body (see AUTH_CONTRACT.md §1–2).
 * - A tiny non-secret **session marker** in localStorage records only "a session
 *   may be resumable", so on reload we know whether to attempt a silent refresh
 *   (and can paint a loading gate) rather than flashing the signed-out screen.
 * - `refreshTokens()` is **single-flight**: concurrent 401s share one in-flight
 *   refresh instead of stampeding `/auth/refresh` (which rotates the token and
 *   would revoke the whole family on a detected "reuse").
 */

import { API_BASE_URL } from "./config";
import { ApiError } from "./errors";

/** Non-secret hint that a refresh cookie may exist; never the token itself. */
const SESSION_MARKER_KEY = "brainite.hasSession";

let accessToken: string | null = null;

// ── Session-expired signalling ──────────────────────────────────────────────
// The client emits this when a refresh fails; AuthProvider subscribes to clear
// state, redirect to /auth and toast. Kept as a tiny pub/sub to avoid coupling
// the token layer to React or the router.
type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

function emitSessionExpired(): void {
  sessionExpiredListeners.forEach((l) => l());
}

// ── Access token (memory) ───────────────────────────────────────────────────
export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

// ── Session marker (localStorage) ───────────────────────────────────────────
function setSessionMarker(present: boolean): void {
  try {
    if (present) window.localStorage.setItem(SESSION_MARKER_KEY, "1");
    else window.localStorage.removeItem(SESSION_MARKER_KEY);
  } catch {
    /* ignore write failures (private mode, quota) */
  }
}

/**
 * Adopt a freshly issued access token (from signin / signup / refresh) and mark
 * the session resumable. The refresh token is never passed here — it lives only
 * in the httpOnly cookie the backend set alongside this access token.
 */
export function setTokens(accessToken: string): void {
  setAccessToken(accessToken);
  setSessionMarker(true);
}

/** Wipe the in-memory token and the marker. Call on logout and on unrecoverable
 * refresh failure. The httpOnly cookie is cleared server-side by `/auth/logout`
 * / a failed rotation — JS can't touch it. */
export function clearTokens(): void {
  setAccessToken(null);
  setSessionMarker(false);
}

/** True when a refresh cookie may still exist — i.e. a session may be resumable. */
export function hasSession(): boolean {
  try {
    return window.localStorage.getItem(SESSION_MARKER_KEY) !== null;
  } catch {
    return false;
  }
}

// ── Single-flight refresh ───────────────────────────────────────────────────
let refreshPromise: Promise<string> | null = null;

/**
 * Exchange the refresh token for a new access token. Concurrent callers share
 * the same in-flight promise. On failure, tokens are cleared and a
 * `session-expired` signal is emitted; the rejection propagates so the caller's
 * original request fails as `unauthorized`.
 */
export function refreshTokens(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function doRefresh(): Promise<string> {
  // No marker → no cookie to spend; short-circuit instead of a guaranteed 401.
  if (!hasSession()) {
    clearTokens();
    emitSessionExpired();
    throw new ApiError("unauthorized", "Session expired", 401);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      // Empty body: the httpOnly refresh cookie carries the token. `credentials:
      // "include"` sends it; the BE rotates the pair and re-sets the cookie.
      credentials: "include",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Network failure during refresh — do NOT clear the session; the token may
    // still be valid once connectivity returns. Surface a retryable error.
    throw new ApiError("network_error", "Could not reach the server", null);
  }

  if (!res.ok) {
    // Only an explicit auth rejection means the refresh token is actually dead.
    // A transient 5xx/429 (proxy hiccup, mid-deploy 502, rate limit) must NOT
    // evict a live session — surface it as retryable and keep the marker, so the
    // request can be retried once connectivity/backend recovers.
    if (res.status === 401 || res.status === 403) {
      clearTokens();
      emitSessionExpired();
      throw new ApiError("unauthorized", "Session expired", res.status);
    }
    throw new ApiError(
      res.status === 429 ? "rate_limited" : "server_error",
      "Could not refresh the session",
      res.status,
    );
  }

  const body = (await res.json()) as {
    data?: { accessToken?: string; refreshToken?: string };
  };
  const next = body.data;
  if (!next?.accessToken) {
    clearTokens();
    emitSessionExpired();
    throw new ApiError("unauthorized", "Malformed refresh response", res.status);
  }

  // `refreshToken` in the body is ignored — the rotated token lives in the fresh
  // cookie the BE just set. We only adopt the new access token.
  setTokens(next.accessToken);
  return next.accessToken;
}
