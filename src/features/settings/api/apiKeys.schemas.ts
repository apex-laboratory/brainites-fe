import { z } from "zod";

import { IsoDateTimeSchema } from "@/lib/api/schemas";

/**
 * Zod schemas for the workspace API-keys endpoints
 * (`/workspaces/{id}/api-keys`). The raw key is returned by `POST` **once** and
 * must never be cached — hold it in component state, not the query cache.
 */

export const ApiKeyScopeSchema = z.enum([
  "brain:query",
  "skills:invoke",
  "sources:read",
  "decisions:read",
]);
export type ApiKeyScope = z.infer<typeof ApiKeyScopeSchema>;

/** Every scope, in the order they're offered. */
export const API_KEY_SCOPES = ApiKeyScopeSchema.options;

/**
 * Human label per scope, declared next to the enum it describes so the two
 * can't drift (same arrangement as `ROLE_LABEL`). Both the settings key
 * manager and the onboarding integrate step read from here.
 */
export const SCOPE_LABEL: Record<ApiKeyScope, string> = {
  "brain:query": "Query the brain",
  "skills:invoke": "Invoke skills",
  "sources:read": "Read sources",
  "decisions:read": "Read decisions",
};

/** `POST /api-keys` → the created key, including the raw secret (shown once). */
export const ApiKeyCreatedSchema = z.object({
  id: z.string(),
  name: z.string(),
  apiKey: z.string(),
  prefix: z.string(),
  scopes: z.array(z.string()),
  createdAt: IsoDateTimeSchema,
});
export type ApiKeyCreated = z.infer<typeof ApiKeyCreatedSchema>;

/** A key in the list response — never carries the raw or hashed key. */
export const ApiKeySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string(),
  scopes: z.array(z.string()),
  createdAt: IsoDateTimeSchema,
  lastUsedAt: IsoDateTimeSchema.nullable(),
});
export type ApiKeySummary = z.infer<typeof ApiKeySummarySchema>;

export const ApiKeyListSchema = z.array(ApiKeySummarySchema);
