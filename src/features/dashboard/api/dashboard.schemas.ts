import { z } from "zod";

import { IsoDateTimeSchema } from "@/lib/api/schemas";

/**
 * Zod schemas for the Dashboard API (`GET /workspaces/{id}/overview` and
 * `/activity`). Responses are camelCase. Presentational enums (`status`) use
 * `.catch(...)` so an unseen backend state degrades to a safe default rather
 * than blanking the whole home screen; ids/counts/timestamps stay strict.
 */

export const KpiSchema = z.object({
  id: z.enum(["decisions", "policies", "skills", "reviews"]).catch("decisions"),
  label: z.string(),
  value: z.number(),
  trend: z.number(),
  spark: z.array(z.number()),
});
export type Kpi = z.infer<typeof KpiSchema>;

export const SyncStateSchema = z.object({
  status: z.enum(["healthy", "syncing", "pending", "error"]).catch("pending"),
  label: z.string(),
  lastSyncedAt: IsoDateTimeSchema.nullable(),
});

/**
 * The workspace block of the overview payload. Deliberately not the auth
 * feature's `WorkspaceSummarySchema` — that one carries `id` and an optional
 * `plan`; this wire shape has a required `plan` and no `id` at all.
 */
export const OverviewWorkspaceSchema = z.object({
  name: z.string(),
  slug: z.string(),
  plan: z.string(),
});

export const ReviewSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.string(),
  sourceProvider: z.string().nullable(),
  sourceLocation: z.string().nullable(),
  confidence: z.number().nullable(),
  status: z.string(),
});
export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;

export const DecisionSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceProvider: z.string().nullable(),
  sourceLocation: z.string().nullable(),
  status: z.string(),
  confidence: z.number().nullable(),
  category: z.string().nullable(),
  monthlyUses: z.number(),
  updatedAt: IsoDateTimeSchema,
  summary: z.string().nullable(),
  rule: z.string().nullable(),
});
export type DecisionSummary = z.infer<typeof DecisionSummarySchema>;

export const SourceSummarySchema = z.object({
  id: z.string(),
  provider: z.string(),
  name: z.string(),
  status: z.string(),
  syncStatus: z.string(),
  lastSyncedAt: IsoDateTimeSchema.nullable(),
  health: z.number().nullable(),
  pendingItems: z.number(),
  activeChannelCount: z.number(),
  extractedLabel: z.string(),
});
export type SourceSummary = z.infer<typeof SourceSummarySchema>;

export const ActivityEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  detail: z.string().nullable(),
  sourceProvider: z.string().nullable(),
  createdAt: IsoDateTimeSchema,
});
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;

export const OverviewSchema = z.object({
  workspace: OverviewWorkspaceSchema,
  greetingName: z.string(),
  sync: SyncStateSchema,
  kpis: z.array(KpiSchema),
  recentQuestions: z.array(z.string()),
  reviewPreview: z.array(ReviewSummarySchema),
  recentDecisions: z.array(DecisionSummarySchema),
  sourceHealth: z.array(SourceSummarySchema),
  activity: z.array(ActivityEventSchema),
});
export type Overview = z.infer<typeof OverviewSchema>;

/** `GET /activity` returns the event array directly in `data` (cursor in meta). */
export const ActivityListSchema = z.array(ActivityEventSchema);
