import { z } from "zod";

import { IsoDateTimeSchema } from "@/lib/api/schemas";

/**
 * Zod schemas for the Decisions API (`/api/v1/decisions`), mirroring the backend
 * `DecisionOut` model (BACKEND_ASKS §8). A decision is a distinct domain object
 * from a skill — its own table, owner, category, and executable `rule`. Responses
 * are camelCase; most fields are nullable. Read-only, role ≥ viewer.
 */

/** Decision owner: display name + a deterministic accent color. */
export const DecisionOwnerSchema = z.object({
  name: z.string().nullish(),
  avatarColor: z.string().nullish(),
});
export type DecisionOwner = z.infer<typeof DecisionOwnerSchema>;

/** One decision (list and get share this shape). */
export const DecisionOutSchema = z.object({
  id: z.string(),
  title: z.string(),
  provider: z.string().nullish(), // source_provider
  location: z.string().nullish(), // source_location
  status: z.string(),
  confidence: z.number().nullish(),
  category: z.string().nullish(),
  owner: DecisionOwnerSchema.nullish(),
  uses: z.number().default(0), // monthly_uses
  updatedAt: IsoDateTimeSchema.nullish(),
  body: z.string().nullish(), // summary
  rule: z.string().nullish(),
});
export type DecisionOut = z.infer<typeof DecisionOutSchema>;

export const DecisionListSchema = z.array(DecisionOutSchema);
