import { z } from "zod";

/**
 * Zod schemas for the Auth API (`/api/v1/auth`). Response bodies are camelCase.
 * TS types are derived with `z.infer` so schema drift fails the typecheck.
 */

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
});
export type User = z.infer<typeof UserSchema>;

export const WorkspaceSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  plan: z.string(),
});
export type WorkspaceSummary = z.infer<typeof WorkspaceSummarySchema>;

/** Where the user should land after this auth call. */
export const NextStepSchema = z.enum(["onboarding", "dashboard"]);
export type NextStep = z.infer<typeof NextStepSchema>;

/** The shared session payload returned by signup / signin / oauth callback. */
export const SessionSchema = z.object({
  user: UserSchema,
  workspace: WorkspaceSummarySchema.nullable(),
  accessToken: z.string(),
  refreshToken: z.string(),
  nextStep: NextStepSchema,
});
export type Session = z.infer<typeof SessionSchema>;

/** `POST /auth/refresh` → rotated token pair. */
export const RefreshResultSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type RefreshResult = z.infer<typeof RefreshResultSchema>;

/** `GET /auth/oauth/{provider}/start` → consent URL + signed state. */
export const OAuthStartSchema = z.object({
  authorizationUrl: z.string().url(),
  state: z.string(),
});
export type OAuthStart = z.infer<typeof OAuthStartSchema>;

export const EmailSchema = z.string().trim().email("Enter a valid email address");
