import { z } from "zod";

import { IsoDateTimeSchema } from "@/lib/api/schemas";

/**
 * Zod schemas for the Reviews API (`/api/v1/reviews`), per the backend
 * `ReviewOut` / `ReviewStats` / `ResolveResult` models. Responses are camelCase;
 * most fields are nullable (a contradiction review may have no single source).
 * All routes are admin-only.
 */

/** Review kinds the pipeline emits. Kept lenient (string) — it's display only. */
export const ReviewKindSchema = z.string();
export const ReviewStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const ReviewSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: ReviewKindSchema,
  status: ReviewStatusSchema,
  verdict: z.string().nullish(),
  sourceProvider: z.string().nullish(),
  sourceLocation: z.string().nullish(),
  beforeText: z.string().nullish(),
  afterText: z.string().nullish(),
  evidenceQuote: z.string().nullish(),
  evidenceAuthor: z.string().nullish(),
  confidence: z.number().nullish(),
  payload: z.record(z.string(), z.unknown()).nullish(),
  skillId: z.string().nullish(),
  comment: z.string().nullish(),
  resolvedBy: z.string().nullish(),
  createdAt: IsoDateTimeSchema,
  resolvedAt: IsoDateTimeSchema.nullish(),
});
export type ReviewOut = z.infer<typeof ReviewSchema>;

export const ReviewListSchema = z.array(ReviewSchema);

/** `GET /reviews/stats` → approve/reject counts + rejection rate. */
export const ReviewStatsSchema = z.object({
  pending: z.number(),
  approved: z.number(),
  rejected: z.number(),
  rejectionRate: z.number(),
});
export type ReviewStats = z.infer<typeof ReviewStatsSchema>;

/** `POST /reviews/{id}/approve|reject` → the recorded verdict. */
export const ResolveResultSchema = z.object({
  id: z.string(),
  status: z.enum(["approved", "rejected"]),
  verdict: z.enum(["approve", "reject"]),
  skillId: z.string().nullish(),
});
export type ResolveResult = z.infer<typeof ResolveResultSchema>;
