import { z } from "zod";

/**
 * Zod schema for the interactions override response (`POST
 * /interactions/{id}/override`), mirroring the backend `OverrideResult` model
 * (Feature 15a feedback loop). Reporting an override drops the matched skill's
 * confidence and may open a review — `reviewCreated` says whether it did.
 */
export const OverrideResultSchema = z.object({
  interactionId: z.string(),
  skillId: z.string().nullish(),
  newConfidence: z.number().nullish(),
  reviewCreated: z.boolean().default(false),
});
export type OverrideResult = z.infer<typeof OverrideResultSchema>;
