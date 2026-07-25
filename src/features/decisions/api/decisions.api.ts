import { api, type Page } from "@/lib/api";

import {
  DecisionListSchema,
  DecisionOutSchema,
  type DecisionOut,
} from "./decisions.schemas";

export type DecisionListParams = {
  status?: string;
  category?: string;
  source?: string;
  /** Page size, 1–100 (backend default 50). */
  limit?: number;
  /** Opaque pagination cursor from a prior page's `nextCursor`. */
  cursor?: string;
};

/**
 * Decisions endpoint functions. Workspace scope comes from the JWT; both routes
 * require role ≥ viewer (read-only).
 */
export const decisionsApi = {
  /** Browse decisions — paginated (`meta.nextCursor`), filterable. */
  list: (params?: DecisionListParams): Promise<Page<DecisionOut[]>> =>
    api.getPage("/decisions", DecisionListSchema, { params }),

  get: (decisionId: string): Promise<DecisionOut> =>
    api.get(`/decisions/${decisionId}`, DecisionOutSchema),
};

/** Query keys for the decisions feature (workspace-keyed so a switch can't serve stale). */
export const decisionKeys = {
  all: (workspaceId: string) => ["decisions", workspaceId] as const,
  list: (workspaceId: string, params?: DecisionListParams) =>
    ["decisions", workspaceId, "list", params ?? {}] as const,
  detail: (workspaceId: string, decisionId: string) =>
    ["decisions", workspaceId, "detail", decisionId] as const,
};
