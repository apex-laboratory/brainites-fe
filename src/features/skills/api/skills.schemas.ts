import { z } from "zod";

import { IsoDateTimeSchema } from "@/lib/api/schemas";

/**
 * Zod schemas for the Skills API (`/api/v1/skills`), mirroring the backend
 * `SkillSearchResult` / `SkillOut` / `SkillVersionOut` models (Phase 5, PRD §14).
 * Responses are camelCase. Reads require `brain:query` (an API key) or role ≥
 * viewer (a dashboard JWT); export is admin-only.
 *
 * `exceptionsBlock` / `actions` are typed as bare lists on the backend with no
 * committed element shape — kept as `unknown[]` here so a shape change can't
 * blank the screen.
 */

/**
 * One semantic-search hit. `similarity` is cosine similarity (0–1). Search only
 * ever returns published skills, so `status` is `active`/`stable`. `calls30d` /
 * `callSeries` / `updatedAt` mirror the browse item so the registry table renders
 * the same usage metrics for search hits and browse rows.
 */
export const SkillSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  status: z.string().nullish(),
  baseLogic: z.string(),
  exceptionsBlock: z.array(z.unknown()).default([]),
  sourceAuthority: z.string().nullish(),
  sourceProviders: z.array(z.string()).default([]),
  similarity: z.number(),
  calls30d: z.number().default(0),
  callSeries: z.array(z.number()).default([]),
  updatedAt: IsoDateTimeSchema.nullish(),
});
export type SkillSearchResult = z.infer<typeof SkillSearchResultSchema>;

export const SkillSearchListSchema = z.array(SkillSearchResultSchema);

/**
 * One row of the browse-the-registry list (`GET /skills`). Same shape as a
 * search hit minus `similarity`, so the FE shares one table view model.
 * `callSeries` is a 7-point daily sparkline (oldest→newest); `sourceProviders`
 * lists every source that contributed to the skill.
 */
export const SkillListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  status: z.string(),
  baseLogic: z.string().nullish(),
  exceptionsBlock: z.array(z.unknown()).default([]),
  sourceAuthority: z.string().nullish(),
  sourceProviders: z.array(z.string()).default([]),
  description: z.string().nullish(),
  calls30d: z.number().default(0),
  callSeries: z.array(z.number()).default([]),
  updatedAt: IsoDateTimeSchema.nullish(),
});
export type SkillListItem = z.infer<typeof SkillListItemSchema>;

export const SkillListSchema = z.array(SkillListItemSchema);

/** `GET /skills/stats` → registry summary strip (mirrors `/reviews/stats`). */
export const SkillStatsSchema = z.object({
  total: z.number(),
  stable: z.number(),
  inReview: z.number(),
  draft: z.number(),
  calls30d: z.number(),
});
export type SkillStats = z.infer<typeof SkillStatsSchema>;

/** Full skill body (`GET /skills/{id}`), served to agents and the dashboard. */
export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  status: z.string(),
  description: z.string().nullish(),
  trigger: z.string().nullish(),
  baseLogic: z.string().nullish(),
  exceptionsBlock: z.array(z.unknown()).default([]),
  actions: z.array(z.unknown()).default([]),
  sourceAuthority: z.string().nullish(),
  sourceProviders: z.array(z.string()).default([]),
  confidence: z.number().nullish(),
  createdAt: IsoDateTimeSchema.nullish(),
  updatedAt: IsoDateTimeSchema.nullish(),
});
export type SkillOut = z.infer<typeof SkillSchema>;

/** One historical version (`GET /skills/{id}/versions`) from `skill_versions`. */
export const SkillVersionSchema = z.object({
  version: z.string(),
  baseLogic: z.string().nullish(),
  exceptionsBlock: z.array(z.unknown()).default([]),
  confidence: z.number().nullish(),
  changeType: z.string().nullish(),
  createdAt: IsoDateTimeSchema.nullish(),
});
export type SkillVersionOut = z.infer<typeof SkillVersionSchema>;

export const SkillVersionListSchema = z.array(SkillVersionSchema);

/**
 * Body for `POST /skills` — manually author a skill from the dashboard
 * (admin-only). The skill lands at status `draft` and opens a review, so a human
 * still confirms it before it becomes agent-queryable. Returns a `SkillOut`.
 */
export type CreateSkillBody = {
  name: string;
  trigger?: string;
  baseLogic: string;
  description?: string;
};

/**
 * Body for `PATCH /skills/{id}` — edit a skill from the dashboard (editor or
 * admin). Every field is optional: only the keys present are written (a partial
 * update), and changing `trigger`/`baseLogic` re-embeds the skill server-side.
 * Returns the updated `SkillOut`. The backend 422s on any unknown key.
 */
export type UpdateSkillBody = {
  name?: string;
  trigger?: string;
  baseLogic?: string;
  description?: string;
};

/**
 * `DELETE /skills/{id}` → the skill was soft-deleted (admin-only). The row stays
 * in the table for history but no read surface serves it again.
 */
export const SkillDeleteResultSchema = z.object({
  id: z.string(),
  deleted: z.boolean(),
});
export type SkillDeleteResult = z.infer<typeof SkillDeleteResultSchema>;

/** Backend caps mirrored from `UpdateSkillRequest`; the FE trims/validates to
 * these before sending so the user sees an inline error, not a 422. */
export const SKILL_NAME_MAX_LENGTH = 200;
export const SKILL_TRIGGER_MAX_LENGTH = 2000;
export const SKILL_BASE_LOGIC_MAX_LENGTH = 20_000;
export const SKILL_DESCRIPTION_MAX_LENGTH = 2000;

/** Backend cap on a submit `note`; anything longer is rejected with a 422. */
export const SUBMIT_NOTE_MAX_LENGTH = 2000;

/**
 * Body for `POST /skills/{id}/submit`. Optional — `note` is context *for the
 * reviewer* and lands on the review's payload, not on the skill. The backend
 * 422s on any unknown key, so nothing else may be sent.
 */
export type SubmitSkillBody = {
  note?: string;
};

/**
 * `POST /skills/{id}/submit` → the draft moved into the review queue
 * (`status: "review"`) and a review card is open at `reviewId`.
 *
 * `reviewCreated: false` means the draft already had an open review — skills
 * authored through `POST /skills` get one at creation — so the existing card was
 * reused. `reviewId` still points at what the reviewer will see, and the call
 * succeeded either way; `false` is never an error.
 */
export const SkillSubmitResultSchema = z.object({
  skillId: z.string(),
  status: z.string(),
  reviewId: z.string(),
  reviewCreated: z.boolean().default(true),
});
export type SkillSubmitResult = z.infer<typeof SkillSubmitResultSchema>;
