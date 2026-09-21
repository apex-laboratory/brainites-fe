import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { ApiError } from "@/lib/api";

import {
  agentKeys,
  agentsApi,
  MAX_CONNECTORS,
  type AgentConnector,
  type AgentConnectorCreateBody,
  type ConnectionStatus,
} from "../api";

/** A connector plus the state the picker renders it in. */
export interface ConnectorEntry {
  connector: AgentConnector;
  /**
   * Whether the calling user has authorized it.
   *
   * **Always `"available"` today.** `GET /agent-credentials` is the backend's
   * phase 2; until it exists nobody can know, and claiming "connected" would be
   * a guess rendered as a fact. Deriving it here keeps the component's shape
   * final — when the endpoint lands this function reads it and nothing else
   * moves.
   */
  status: ConnectionStatus;
}

/**
 * This agent's MCP servers.
 *
 * A connector is only half a declaration until it reaches Anthropic, and the
 * backend does that push inside the add/remove calls — so a successful mutation
 * here means the agent can actually reach the server, not merely that we
 * recorded it. That is why neither mutation below is optimistic: showing a
 * connector that failed to attach would misrepresent what the agent can do.
 */
export function useAgentConnectors(agentId: string | undefined) {
  const workspaceId = useWorkspaceId();

  const query = useQuery({
    queryKey: agentKeys.connectors(workspaceId, agentId ?? "new"),
    queryFn: () => agentsApi.connectors(agentId as string),
    enabled: Boolean(agentId),
  });

  const entries = useMemo<ConnectorEntry[]>(
    () => (query.data ?? []).map((connector) => ({ connector, status: "available" as const })),
    [query.data],
  );

  const atCapacity = entries.length >= MAX_CONNECTORS;

  return { ...query, entries, atCapacity, remaining: MAX_CONNECTORS - entries.length };
}

export function useAddConnector(agentId: string) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AgentConnectorCreateBody) => agentsApi.addConnector(agentId, body),

    onSuccess: (connector) => {
      toast.success(`${connector.name} connected`, {
        description: "This agent can now use its tools.",
      });
    },

    onError: (error) => {
      // 409 covers both a duplicate name and the 20-connector cap; the server's
      // message says which, and it is more specific than anything we'd invent.
      if (error instanceof ApiError && error.status === 409) {
        toast.error("Couldn't add that connector", { description: error.message });
        return;
      }
      toast.error("Couldn't add that connector");
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: agentKeys.connectors(workspaceId, agentId),
      });
      // Adding a connector mints a new Anthropic agent version.
      void queryClient.invalidateQueries({ queryKey: agentKeys.detail(workspaceId, agentId) });
    },
  });
}

export function useRemoveConnector(agentId: string) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectorId: string) => agentsApi.removeConnector(agentId, connectorId),

    onSuccess: () => toast.success("Connector removed"),

    onError: () => toast.error("Couldn't remove that connector"),

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: agentKeys.connectors(workspaceId, agentId),
      });
      void queryClient.invalidateQueries({ queryKey: agentKeys.detail(workspaceId, agentId) });
    },
  });
}
