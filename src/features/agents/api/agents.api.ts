import { z } from "zod";

import { api } from "@/lib/api";

import {
  AgentConnectorListSchema,
  AgentConnectorSchema,
  AgentListSchema,
  AgentSchema,
  AgentVersionListSchema,
  type Agent,
  type AgentConnector,
  type AgentConnectorCreateBody,
  type AgentCreateBody,
  type AgentUpdateBody,
  type AgentVersion,
} from "./agents.schemas";

/**
 * Agent Builder endpoint functions (`/api/v1/agents`).
 *
 * Workspace scope comes from the JWT, so no `workspaceId` is threaded through
 * these paths. Every route is dashboard-only (JWT, not an API key); the writes
 * additionally require `editor` and, for anything on a specific agent, that the
 * caller owns it.
 *
 * Two error codes are worth handling deliberately upstream of here:
 *  - **409 on `update`** — someone else edited the agent since you loaded it.
 *    Note the backend 409s on a stale `version` even when the fields you send
 *    already equal the stored ones, so a no-op save can conflict.
 *  - **501 on any write** — `ANTHROPIC_API_KEY` is unset on the server. That is
 *    a deployment state, not a user error, and should not read as one.
 */
export const agentsApi = {
  /** Agents visible to the caller: own private plus workspace-published. */
  list: (): Promise<Agent[]> => api.get("/agents", AgentListSchema),

  get: (agentId: string): Promise<Agent> => api.get(`/agents/${agentId}`, AgentSchema),

  /** Create the agent. Provisions it on Anthropic, then stores our mirror. */
  create: (body: AgentCreateBody): Promise<Agent> => api.post("/agents", AgentSchema, body),

  /**
   * Partial update. Send only the keys you are changing — the backend reads the
   * body with `exclude_unset`, so an omitted key is "leave alone" and an
   * explicit `null` is "clear".
   */
  update: (agentId: string, body: AgentUpdateBody): Promise<Agent> =>
    api.patch(`/agents/${agentId}`, AgentSchema, body),

  /** Make the agent visible to the whole workspace. Owner only. */
  publish: (agentId: string): Promise<Agent> =>
    api.post(`/agents/${agentId}/publish`, AgentSchema),

  /** Take it back to private. Owner only. */
  unpublish: (agentId: string): Promise<Agent> =>
    api.post(`/agents/${agentId}/unpublish`, AgentSchema),

  /**
   * The agent's version history, proxied from Anthropic on demand rather than
   * mirrored. Empty for a draft that has never synced.
   */
  versions: (agentId: string): Promise<AgentVersion[]> =>
    api.get(`/agents/${agentId}/versions`, AgentVersionListSchema),

  /** The MCP servers this agent talks to. Never any credential material. */
  connectors: (agentId: string): Promise<AgentConnector[]> =>
    api.get(`/agents/${agentId}/connectors`, AgentConnectorListSchema),

  /**
   * Declare an MCP server. The backend pushes the agent's whole tool config to
   * Anthropic as part of this call, so a success here means the agent can
   * actually reach the server — not just that we recorded it.
   */
  addConnector: (agentId: string, body: AgentConnectorCreateBody): Promise<AgentConnector> =>
    api.post(`/agents/${agentId}/connectors`, AgentConnectorSchema, body),

  /** Undeclare an MCP server. `204`, so there is no body to validate. */
  removeConnector: (agentId: string, connectorId: string): Promise<void> =>
    api
      .delete(`/agents/${agentId}/connectors/${connectorId}`, z.unknown())
      .then(() => undefined),
};

/**
 * Query keys.
 *
 * Keyed by workspace like every other feature, even though the workspace never
 * appears in the path: switching workspaces must not show the previous one's
 * agents from cache. `detail` is a prefix of `versions` and `connectors`, so
 * invalidating an agent refreshes everything about it — pass `exact: true`
 * where that is not what you want.
 */
export const agentKeys = {
  all: (workspaceId: string) => ["agents", workspaceId] as const,
  detail: (workspaceId: string, agentId: string) => ["agents", workspaceId, agentId] as const,
  versions: (workspaceId: string, agentId: string) =>
    ["agents", workspaceId, agentId, "versions"] as const,
  connectors: (workspaceId: string, agentId: string) =>
    ["agents", workspaceId, agentId, "connectors"] as const,
};
