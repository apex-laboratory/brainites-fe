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
  // Backend types this as a bare `str`; fall back rather than blank the queue on
  // an unexpected value.
  status: ReviewStatusSchema.catch("pending"),
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

/** `GET /reviews/stats` → approve/reject counts, rejection rate, queue age. */
export const ReviewStatsSchema = z.object({
  pending: z.number(),
  approved: z.number(),
  rejected: z.number(),
  rejectionRate: z.number(),
  /**
   * When the longest-waiting pending review was created; `null` on an empty
   * queue. The count alone under-reports a stalled queue — three items from a
   * minute ago and three that have sat for a fortnight are the same number and
   * very different situations. This is what the dashboard escalates on.
   */
  oldestPendingAt: IsoDateTimeSchema.nullish(),
});
export type ReviewStats = z.infer<typeof ReviewStatsSchema>;

/** `POST /reviews/{id}/approve|reject|write|resolve` → the recorded verdict. */
export const ResolveResultSchema = z.object({
  id: z.string(),
  status: z.enum(["approved", "rejected"]),
  verdict: z.enum(["approve", "reject"]),
  skillId: z.string().nullish(),
});
export type ResolveResult = z.infer<typeof ResolveResultSchema>;

/** One row of a `POST /reviews/bulk-approve` result. */
export const BulkApproveItemSchema = z.object({
  id: z.string(),
  status: z.enum(["approved", "skipped", "error"]),
  detail: z.string().nullish(),
});
export type BulkApproveItem = z.infer<typeof BulkApproveItemSchema>;

/** `POST /reviews/bulk-approve` → per-id outcomes + approved/skipped totals. */
export const BulkApproveResultSchema = z.object({
  results: z.array(BulkApproveItemSchema),
  approved: z.number(),
  skipped: z.number(),
});
export type BulkApproveResult = z.infer<typeof BulkApproveResultSchema>;
