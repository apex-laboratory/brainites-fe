import { api } from "@/lib/api";

import {
  InviteResultSchema,
  MemberListSchema,
  SettingsSchema,
  UpdateSettingsSchema,
  type InviteResult,
  type Member,
  type MemberRole,
  type Settings,
  type UpdateSettings,
} from "./settings.schemas";

/** Partial settings update — send only the fields being changed. */
export interface UpdateSettingsInput {
  name?: string;
  domain?: string | null;
}

export interface InviteInput {
  email: string;
  role: MemberRole;
}

/**
 * Settings + Members endpoint functions. All are workspace-scoped in the path.
 * Reads need any member; `update` and `invite` require an admin (a non-admin
 * gets 403, surfaced as the global mutation error toast).
 */
export const settingsApi = {
  get: (workspaceId: string): Promise<Settings> =>
    api.get(`/workspaces/${workspaceId}/settings`, SettingsSchema),

  update: (workspaceId: string, fields: UpdateSettingsInput): Promise<UpdateSettings> =>
    api.patch(`/workspaces/${workspaceId}/settings`, UpdateSettingsSchema, fields),

  members: (workspaceId: string): Promise<Member[]> =>
    api.get(`/workspaces/${workspaceId}/members`, MemberListSchema),

  invite: (workspaceId: string, body: InviteInput): Promise<InviteResult> =>
    api.post(`/workspaces/${workspaceId}/members/invite`, InviteResultSchema, body),
};

export const settingsKeys = {
  settings: (workspaceId: string) => ["settings", workspaceId] as const,
  members: (workspaceId: string) => ["members", workspaceId] as const,
};
