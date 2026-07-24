import { z } from "zod";

import { IsoDateTimeSchema } from "@/lib/api/schemas";

/**
 * Zod schemas for the brain chat API (`/api/v1/brain`), per the backend
 * `BrainStatusResponse` / `BrainQueryResponse` models
 * (`app/modules/brain/schemas.py`, BACKEND_ASKS §7).
 *
 * Both routes are gated by `require_brain_access("brain:query")`, which admits a
 * dashboard JWT at role >= viewer, so the normal session token reaches them.
 */

/** `GET /brain/status` — lets the UI gate the composer without firing a 409. */
export const BrainStatusSchema = z.object({
  enabled: z.boolean(),
  ready: z.boolean(),
  skillsIndexed: z.number(),
  /** `null` when ready, else `"disabled"` (kill-switch) or `"no_skills"`. */
  reason: z.enum(["disabled", "no_skills"]).nullish(),
});
export type BrainStatus = z.infer<typeof BrainStatusSchema>;

/**
 * One source the answer drew on. `provider` is a raw backend provider id; the UI
 * narrows it to a known `SourceId` before rendering an icon. `url`/`excerpt` are
 * filled from the Phase 3 evidence graph and may be absent on older answers.
 */
export const SourceCitationSchema = z.object({
  provider: z.string().nullish(),
  location: z.string().nullish(),
  skillId: z.string().nullish(),
  url: z.string().nullish(),
  excerpt: z.string().nullish(),
});
export type SourceCitation = z.infer<typeof SourceCitationSchema>;

/**
 * A governance actor in a skill's lineage. Every field is nullable by design —
 * the backend returns `null` when the write path never recorded it rather than
 * letting the model infer one, so the UI must render partial people.
 */
export const ProvenancePersonSchema = z.object({
  name: z.string().nullish(),
  at: IsoDateTimeSchema.nullish(),
  via: z.string().nullish(),
  location: z.string().nullish(),
  changeType: z.string().nullish(),
});
export type ProvenancePerson = z.infer<typeof ProvenancePersonSchema>;

export const BrainProvenanceSchema = z.object({
  approvedBy: ProvenancePersonSchema.nullish(),
  originatedBy: ProvenancePersonSchema.nullish(),
  createdBy: ProvenancePersonSchema.nullish(),
  lastEditedBy: ProvenancePersonSchema.nullish(),
});
export type BrainProvenance = z.infer<typeof BrainProvenanceSchema>;

/**
 * How much the answer can be trusted:
 * `skill` — a reviewed rule · `evidence` — a cited source in a skill's lineage ·
 * `none` — no reviewed skill covers it (an honest miss, never a guess).
 */
export const TrustSchema = z.enum(["skill", "evidence", "none"]).catch("none");
export type Trust = z.infer<typeof TrustSchema>;

/** `POST /brain/query` — the answer envelope. */
export const BrainQueryResponseSchema = z.object({
  answer: z.string(),
  trust: TrustSchema,
  confidence: z.number(),
  matchType: z.string(),
  sources: z.array(SourceCitationSchema).catch([]),
  skillIds: z.array(z.string()).catch([]),
  provenance: BrainProvenanceSchema.nullish(),
  conversationId: z.string().nullish(),
  messageId: z.string().nullish(),
  /** Always present — pass to `POST /interactions/{id}/override` on a thumbs-down. */
  interactionId: z.string(),
});
export type BrainQueryResponse = z.infer<typeof BrainQueryResponseSchema>;
