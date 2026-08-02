import { api, type Page } from "@/lib/api";

import {
  SkillListSchema,
  SkillSchema,
  SkillSearchListSchema,
  SkillStatsSchema,
  SkillSubmitResultSchema,
  SkillVersionListSchema,
  type CreateSkillBody,
  type SkillListItem,
  type SkillOut,
  type SkillSearchResult,
  type SkillStats,
  type SkillSubmitResult,
  type SkillVersionOut,
  type SubmitSkillBody,
} from "./skills.schemas";

export type SkillSearchParams = {
  /** Free-text query (1–2000 chars, required by the backend). */
  q: string;
  /** Max hits, 1–20 (backend default 5). */
  limit?: number;
};

export type SkillListParams = {
  status?: string;
  source?: string;
  /** Page size, 1–100 (backend default 50). */
  limit?: number;
  /** Opaque pagination cursor from a prior page's `nextCursor`. */
  cursor?: string;
};

/**
 * The Drafts tab's list params, shared rather than inlined: `useSubmitSkill`
 * patches the exact infinite-query cache `useDraftSkills` reads, and a key built
 * from a second literal would silently miss it.
 */
export const DRAFT_LIST_PARAMS: SkillListParams = { status: "draft", limit: 50 };

/**
 * Skills endpoint functions. Workspace scope comes from the JWT; reads require
 * role ≥ viewer (a viewer/editor/admin all pass), so unlike reviews these are
 * not admin-gated. `create` is admin-only (a viewer/editor 403s).
 */
export const skillsApi = {
  /** Browse the registry without a query — paginated (`meta.nextCursor`). */
  list: (params?: SkillListParams): Promise<Page<SkillListItem[]>> =>
    api.getPage("/skills", SkillListSchema, { params }),

  search: (params: SkillSearchParams): Promise<SkillSearchResult[]> =>
    api.get("/skills/search", SkillSearchListSchema, { params }),

  stats: (): Promise<SkillStats> => api.get("/skills/stats", SkillStatsSchema),

  get: (skillId: string): Promise<SkillOut> =>
    api.get(`/skills/${skillId}`, SkillSchema),

  versions: (skillId: string): Promise<SkillVersionOut[]> =>
    api.get(`/skills/${skillId}/versions`, SkillVersionListSchema),

  /** Manually author a skill (admin-only) → a `draft` in the review queue. */
  create: (body: CreateSkillBody): Promise<SkillOut> =>
    api.post("/skills", SkillSchema, body),

  /**
   * Move a draft into the review queue (`draft` → `review`) and open its review
   * card. Admin JWT only — a viewer/editor and *any* API key get a 403, so
   * agents can't queue skills. Rate limited to 300/min per user.
   *
   * Fails with 404 when the skill is unknown or soft-deleted, and 409 when it
   * isn't a draft (either it never was — the message names its real status — or
   * a concurrent submit won the race). Both are safe to retry after a refresh;
   * neither leaves partial state.
   */
  submit: (skillId: string, body?: SubmitSkillBody): Promise<SkillSubmitResult> =>
    api.post(`/skills/${skillId}/submit`, SkillSubmitResultSchema, body),
};

/** Query keys for the skills feature (workspace-keyed so a switch can't serve stale). */
export const skillKeys = {
  all: (workspaceId: string) => ["skills", workspaceId] as const,
  list: (workspaceId: string, params?: SkillListParams) =>
    ["skills", workspaceId, "list", params ?? {}] as const,
  stats: (workspaceId: string) => ["skills", workspaceId, "stats"] as const,
  search: (workspaceId: string, params: SkillSearchParams) =>
    ["skills", workspaceId, "search", params] as const,
  detail: (workspaceId: string, skillId: string) =>
    ["skills", workspaceId, "detail", skillId] as const,
  versions: (workspaceId: string, skillId: string) =>
    ["skills", workspaceId, "versions", skillId] as const,
};
