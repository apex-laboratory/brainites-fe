import { z } from "zod";

import { api } from "@/lib/api";

import {
  OAuthStartSchema,
  SessionSchema,
  type NextStep,
  type OAuthStart,
  type Session,
} from "./auth.schemas";

/** OAuth SSO providers the backend supports for dashboard login. */
export type OAuthProvider = "google" | "github";
export type OAuthMode = "signin" | "signup";

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
   * Revoke the refresh token server-side. Fire-and-forget from the caller's
   * perspective — logout must succeed locally even if this fails. Returns void
   * (204).
   */
  logout: (refreshToken: string | null): Promise<void> =>
    api.post(
      "/auth/logout",
      z.void(),
      refreshToken ? { refreshToken } : {},
      { skipAuth: true },
    ),
};

export type { NextStep, Session, OAuthStart };
