import { z } from "zod";

import { api } from "@/lib/api";

import {
  MeSchema,
  OAuthStartSchema,
  SessionSchema,
  type Me,
  type NextStep,
  type OAuthStart,
  type Session,
} from "./auth.schemas";

/** OAuth SSO providers the backend supports for dashboard login. */
export type OAuthProvider = "google" | "github";
export type OAuthMode = "signin" | "signup";

/**
 * The provider redirect_uri the BE registers is a single FE page —
 * `{FRONTEND_URL}/auth/callback` (no provider in the path). So the callback page
 * can't learn the provider from the URL; we stash it in sessionStorage when the
 * flow starts and read it back on return. See AUTH_CONTRACT.md §4.
 */
const OAUTH_PROVIDER_KEY = "brainite.oauthProvider";

export function rememberOAuthProvider(provider: OAuthProvider): void {
  try {
    window.sessionStorage.setItem(OAUTH_PROVIDER_KEY, provider);
  } catch {
    /* ignore write failures (private mode, quota) */
  }
}

export function recallOAuthProvider(): OAuthProvider | null {
  try {
    const v = window.sessionStorage.getItem(OAUTH_PROVIDER_KEY);
    return v === "google" || v === "github" ? v : null;
  } catch {
    return null;
  }
}

export function clearOAuthProvider(): void {
  try {
    window.sessionStorage.removeItem(OAUTH_PROVIDER_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Auth endpoint functions. All are `skipAuth` — they mint or rotate the token
 * themselves and must not carry (or retry with) a Bearer header.
 *
 * NOTE: the backend is passwordless — signup/signin take only `{ email }`.
 * See BE_AUTH_QUESTIONS.md for the password-field reconciliation.
 */
export const authApi = {
  signup: (email: string): Promise<Session> =>
    api.post("/auth/signup", SessionSchema, { email }, { skipAuth: true }),

  signin: (email: string): Promise<Session> =>
    api.post("/auth/signin", SessionSchema, { email }, { skipAuth: true }),

  /**
   * Rehydrate authoritative identity from the access token on reload. Requires
   * a valid Bearer JWT (not `skipAuth`), so it will transparently refresh once
   * if the in-memory access token has expired. See BE_AUTH_QUESTIONS.md §3.
   */
  me: (): Promise<Me> => api.get("/auth/me", MeSchema),

  /** Get the provider consent URL to redirect the browser to. */
  oauthStart: (
    provider: OAuthProvider,
    mode: OAuthMode = "signin",
  ): Promise<OAuthStart> =>
    api.get(`/auth/oauth/${provider}/start`, OAuthStartSchema, {
      params: { mode },
      skipAuth: true,
    }),

  /** Complete OAuth by exchanging the provider `code` + `state` for a session. */
  oauthCallback: (
    provider: OAuthProvider,
    code: string,
    state: string,
  ): Promise<Session> =>
    api.post(
      `/auth/oauth/${provider}/callback`,
      SessionSchema,
      { code, state },
      { skipAuth: true },
    ),

  /**
   * Revoke the refresh token server-side. The token rides the httpOnly cookie
   * (`credentials: "include"` is on every request), so the body is empty.
   * Fire-and-forget from the caller's perspective — logout must succeed locally
   * even if this fails. Idempotent; returns void (204).
   */
  logout: (): Promise<void> =>
    api.post("/auth/logout", z.void(), undefined, { skipAuth: true }),
};

export type { Me, NextStep, Session, OAuthStart };
