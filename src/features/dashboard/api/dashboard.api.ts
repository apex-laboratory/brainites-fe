import { api } from "@/lib/api";

import {
  ActivityListSchema,
  OverviewSchema,
  type ActivityEvent,
  type Overview,
} from "./dashboard.schemas";

/**
 * Dashboard endpoint functions. Both are workspace-scoped in the path and
 * require an authenticated member (a non-member gets 403).
 */
export const dashboardApi = {
  overview: (workspaceId: string): Promise<Overview> =>
    api.get(`/workspaces/${workspaceId}/overview`, OverviewSchema),

  /** Cursor-paginated activity feed. `limit` is capped at 100 by the backend. */
  activity: (
    workspaceId: string,
    params?: { limit?: number; cursor?: string },
  ): Promise<ActivityEvent[]> =>
    api.get(`/workspaces/${workspaceId}/activity`, ActivityListSchema, { params }),
};

export const dashboardKeys = {
  overview: (workspaceId: string) => ["overview", workspaceId] as const,
  activity: (workspaceId: string) => ["activity", workspaceId] as const,
};
