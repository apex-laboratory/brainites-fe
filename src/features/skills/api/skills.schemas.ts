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

/** One semantic-search hit. `similarity` is cosine similarity (0–1). */
export const SkillSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  baseLogic: z.string(),
  exceptionsBlock: z.array(z.unknown()).default([]),
  sourceAuthority: z.string().nullish(),
  similarity: z.number(),
});
export type SkillSearchResult = z.infer<typeof SkillSearchResultSchema>;

export const SkillSearchListSchema = z.array(SkillSearchResultSchema);

/** Full skill body (`GET /skills/{id}`), served to agents and the dashboard. */
export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  status: z.string(),
  trigger: z.string().nullish(),
  baseLogic: z.string().nullish(),
  exceptionsBlock: z.array(z.unknown()).default([]),
  actions: z.array(z.unknown()).default([]),
  sourceAuthority: z.string().nullish(),
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
