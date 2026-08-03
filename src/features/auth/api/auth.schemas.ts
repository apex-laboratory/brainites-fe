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
  // The session/onboarding workspace payload is lean — it does NOT carry `plan`
  // (only the Settings/Dashboard workspace endpoints do). Optional so a valid
  // session response isn't rejected at the validation boundary.
  plan: z.string().optional(),
});
export type WorkspaceSummary = z.infer<typeof WorkspaceSummarySchema>;

/** Where the user should land after this auth call. */
export const NextStepSchema = z.enum(["onboarding", "dashboard"]);
export type NextStep = z.infer<typeof NextStepSchema>;

/** The caller's role in the active workspace; `null` before onboarding. */
export const AuthRoleSchema = z.enum(["viewer", "editor", "admin"]);
export type AuthRole = z.infer<typeof AuthRoleSchema>;

/**
 * `GET /auth/me` → authoritative session identity on reload. Note the workspace
 * here is leaner than `WorkspaceSummarySchema` (no `plan`), and `role` is only
 * ever present on this endpoint — signin/signup/oauth sessions don't carry it.
 * `workspace`/`role` are `null` before onboarding (`nextStep: "onboarding"`).
 */
export const MeWorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});
export type MeWorkspace = z.infer<typeof MeWorkspaceSchema>;

export const MeSchema = z.object({
  user: UserSchema,
  workspace: MeWorkspaceSchema.nullable(),
  // `.catch("viewer")`: the backend types role as an open string — a role we
  // don't know yet must degrade to least privilege, not fail the whole
  // /auth/me parse (which would strand the app on a stale localStorage
  // identity snapshot).
  role: AuthRoleSchema.nullable().catch("viewer"),
  nextStep: NextStepSchema,
});
export type Me = z.infer<typeof MeSchema>;

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
