import { api } from "@/lib/api";

import { OverrideResultSchema, type OverrideResult } from "./interactions.schemas";

/**
 * Interactions endpoint functions (`/api/v1/interactions`). The override loop is
 * primarily the agent surface — the backend gates it on the `skills:invoke`
 * scope. `reason` is optional free text explaining why the skill was overridden.
 */
export const interactionsApi = {
  override: (interactionId: string, reason?: string): Promise<OverrideResult> =>
    api.post(
      `/interactions/${interactionId}/override`,
      OverrideResultSchema,
      reason ? { reason } : undefined,
    ),
};

/** Query keys for interactions (workspace-keyed). */
export const interactionKeys = {
  all: (workspaceId: string) => ["interactions", workspaceId] as const,
};
