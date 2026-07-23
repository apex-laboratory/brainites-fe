import { api } from "@/lib/api";

import {
  SkillSchema,
  SkillSearchListSchema,
  type SkillOut,
  type SkillSearchResult,
} from "./skills.schemas";

export type SkillSearchParams = {
  /** Free-text query (1–2000 chars, required by the backend). */
  q: string;
  /** Max hits, 1–20 (backend default 5). */
  limit?: number;
};

/**
 * Skills endpoint functions. Workspace scope comes from the JWT; reads require
 * role ≥ viewer (a viewer/editor/admin all pass), so unlike reviews these are
 * not admin-gated.
 */
export const skillsApi = {
  search: (params: SkillSearchParams): Promise<SkillSearchResult[]> =>
    api.get("/skills/search", SkillSearchListSchema, { params }),

  get: (skillId: string): Promise<SkillOut> =>
    api.get(`/skills/${skillId}`, SkillSchema),
};

/** Query keys for the skills feature (workspace-keyed so a switch can't serve stale). */
export const skillKeys = {
  all: (workspaceId: string) => ["skills", workspaceId] as const,
  search: (workspaceId: string, params: SkillSearchParams) =>
    ["skills", workspaceId, "search", params] as const,
  detail: (workspaceId: string, skillId: string) =>
    ["skills", workspaceId, "detail", skillId] as const,
};
