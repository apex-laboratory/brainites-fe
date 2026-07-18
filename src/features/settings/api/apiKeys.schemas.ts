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
