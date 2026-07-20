import { api } from "@/lib/api";

import {
  ResolveResultSchema,
  ReviewListSchema,
  ReviewSchema,
  ReviewStatsSchema,
  type ResolveResult,
  type ReviewOut,
  type ReviewStats,
} from "./reviews.schemas";

export type ReviewListParams = {
  status?: "pending" | "approved" | "rejected";
  kind?: string;
  limit?: number;
};

/**
 * Reviews endpoint functions. Workspace scope comes from the JWT; every route
 * requires an **admin** role (a viewer/editor gets 403).
 */
export const reviewsApi = {
  list: (params?: ReviewListParams): Promise<ReviewOut[]> =>
    api.get("/reviews", ReviewListSchema, { params }),

  stats: (): Promise<ReviewStats> => api.get("/reviews/stats", ReviewStatsSchema),

  get: (reviewId: string): Promise<ReviewOut> =>
    api.get(`/reviews/${reviewId}`, ReviewSchema),

  approve: (reviewId: string, comment?: string): Promise<ResolveResult> =>
    api.post(`/reviews/${reviewId}/approve`, ResolveResultSchema, comment ? { comment } : undefined),

  reject: (reviewId: string, comment?: string): Promise<ResolveResult> =>
    api.post(`/reviews/${reviewId}/reject`, ResolveResultSchema, comment ? { comment } : undefined),
};

/** Query keys for the reviews feature (workspace-keyed so a switch can't serve stale). */
export const reviewKeys = {
  all: (workspaceId: string) => ["reviews", workspaceId] as const,
  list: (workspaceId: string, params?: ReviewListParams) =>
    ["reviews", workspaceId, "list", params ?? {}] as const,
  stats: (workspaceId: string) => ["reviews", workspaceId, "stats"] as const,
  detail: (workspaceId: string, reviewId: string) =>
    ["reviews", workspaceId, "detail", reviewId] as const,
};
