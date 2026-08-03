import { api, type Page } from "@/lib/api";

import {
  ActivityListSchema,
  OverviewSchema,
  UsageSchema,
  type ActivityEvent,
  type Overview,
  type Usage,
} from "./dashboard.schemas";

/**
 * Dashboard endpoint functions. Both are workspace-scoped in the path and
 * require an authenticated member (a non-member gets 403).
 */
export const dashboardApi = {
  overview: (workspaceId: string): Promise<Overview> =>
    api.get(`/workspaces/${workspaceId}/overview`, OverviewSchema),

  /**
   * Cursor-paginated activity feed. `limit` is capped at 100 by the backend.
   * Uses `getPage` so `meta.nextCursor` survives — with a plain `get` the
   * cursor this endpoint returns would be discarded and the feed could only
   * ever show its first page.
   */
  activity: (
    workspaceId: string,
    params?: { limit?: number; cursor?: string },
  ): Promise<Page<ActivityEvent[]>> =>
    api.getPage(`/workspaces/${workspaceId}/activity`, ActivityListSchema, { params }),

  /** Measured usage counters (settings Usage tab + sidebar meter). */
  usage: (workspaceId: string): Promise<Usage> =>
    api.get(`/workspaces/${workspaceId}/usage`, UsageSchema),
};

export const dashboardKeys = {
  overview: (workspaceId: string) => ["overview", workspaceId] as const,
  activity: (workspaceId: string) => ["activity", workspaceId] as const,
  usage: (workspaceId: string) => ["usage", workspaceId] as const,
};
