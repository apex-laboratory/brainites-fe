import {
  type Agent,
  type AgentEffort,
  type AgentModel,
  type AgentUpdateBody,
} from "../api";

/** The editable shape. Mirrors the fields the create/update bodies accept. */
export interface AgentFormState {
  name: string;
  description: string;
  systemPrompt: string;
  model: AgentModel;
  effort: AgentEffort | null;
  groundInBrain: boolean;
}

export function formStateFrom(agent: Agent | undefined): AgentFormState {
  return {
    name: agent?.name ?? "",
    description: agent?.description ?? "",
    systemPrompt: agent?.systemPrompt ?? "",
    model: (agent?.model as AgentModel) ?? "claude-opus-5",
    effort: (agent?.effort as AgentEffort) ?? null,
    groundInBrain: agent?.groundInBrain ?? true,
  };
}

/**
 * Only what changed.
 *
 * The backend reads a PATCH body with `exclude_unset`, so sending the whole
 * form mints an Anthropic agent version for a save that changed nothing.
 * Versions are the agent's audit trail and rollback surface, so filling them
 * with no-ops makes both useless. Empty strings become `null` — the user
 * clearing a description means "remove it", not "set it to empty".
 */
export function changedFields(
  next: AgentFormState,
  original: AgentFormState,
): AgentUpdateBody {
  const body: AgentUpdateBody = {};
  if (next.name !== original.name) body.name = next.name.trim();
  if (next.description !== original.description) {
    body.description = next.description.trim() || null;
  }
  if (next.systemPrompt !== original.systemPrompt) {
    body.systemPrompt = next.systemPrompt.trim() || null;
  }
  if (next.model !== original.model) body.model = next.model;
  if (next.effort !== original.effort) body.effort = next.effort;
  if (next.groundInBrain !== original.groundInBrain) body.groundInBrain = next.groundInBrain;
  return body;
}
