import { z } from "zod";

import { api } from "@/lib/api";

import {
  ApiKeyCreatedSchema,
  ApiKeyListSchema,
  type ApiKeyCreated,
  type ApiKeyScope,
  type ApiKeySummary,
} from "./apiKeys.schemas";

export interface CreateApiKeyInput {
  name: string;
  scopes: ApiKeyScope[];
}

/**
 * Workspace API-key endpoint functions. Admin-only. The raw key from `create`
 * is shown once — callers hold it in local state and never cache it.
 */
export const apiKeysApi = {
  list: (workspaceId: string): Promise<ApiKeySummary[]> =>
    api.get(`/workspaces/${workspaceId}/api-keys`, ApiKeyListSchema),

  create: (workspaceId: string, body: CreateApiKeyInput): Promise<ApiKeyCreated> =>
    api.post(`/workspaces/${workspaceId}/api-keys`, ApiKeyCreatedSchema, body),

  revoke: (workspaceId: string, keyId: string): Promise<void> =>
    api.delete(`/workspaces/${workspaceId}/api-keys/${keyId}`, z.void()),
};

export const apiKeyKeys = {
  all: (workspaceId: string) => ["api-keys", workspaceId] as const,
};
