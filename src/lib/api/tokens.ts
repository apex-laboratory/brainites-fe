/**
 * Token store + refresh coordination.
 *
 * - The **access token** lives in memory only (never persisted) — it is short
 *   lived (~15 min) and re-minted from the refresh token on reload.
 * - The **refresh token** is persisted to localStorage as an MVP tradeoff. The
 *   backend also sets it as an httpOnly cookie scoped to `/api/v1/auth`; once we
 *   run same-site behind a shared domain we can drop the localStorage copy and
 *   rely on the cookie (see BE_AUTH_QUESTIONS.md).
 * - `refreshTokens()` is **single-flight**: concurrent 401s share one in-flight
 *   refresh instead of stampeding `/auth/refresh` (which rotates the token and
 *   would revoke the whole family on a detected "reuse").
 */

import { API_BASE_URL } from "./config";
import { ApiError } from "./errors";

const REFRESH_TOKEN_KEY = "brainite.refreshToken";

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

// ── Refresh token (localStorage) ────────────────────────────────────────────
export function getRefreshToken(): string | null {
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setRefreshToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    /* ignore write failures (private mode, quota) */
  }
}

/** Persist a freshly issued token pair after signin / signup / refresh. */
export function setTokens(tokens: {
  accessToken: string;
  refreshToken?: string | null;
}): void {
  setAccessToken(tokens.accessToken);
  if (tokens.refreshToken !== undefined) setRefreshToken(tokens.refreshToken);
}

/** Wipe both tokens. Call on logout and on unrecoverable refresh failure. */
export function clearTokens(): void {
  setAccessToken(null);
  setRefreshToken(null);
}

/** True when we hold a refresh token — i.e. a session may be resumable. */
export function hasSession(): boolean {
  return getRefreshToken() !== null;
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
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    emitSessionExpired();
    throw new ApiError("unauthorized", "Session expired", 401);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Include the cookie-based refresh token too, if the BE set one.
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Network failure during refresh — do NOT clear the session; the token may
    // still be valid once connectivity returns. Surface a retryable error.
    throw new ApiError("network_error", "Could not reach the server", null);
  }

  if (!res.ok) {
    clearTokens();
    emitSessionExpired();
    throw new ApiError("unauthorized", "Session expired", res.status);
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

  setTokens({ accessToken: next.accessToken, refreshToken: next.refreshToken });
  return next.accessToken;
}
