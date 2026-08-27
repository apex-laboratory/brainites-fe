import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import type { Stat } from "@/components/shared";

import { agentKeys, agentsApi, type Agent } from "../api";

/**
 * Read model for the Agents screen.
 *
 * The list splits into *Yours* and *Shared in {workspace}* — the two groups the
 * page renders — using the server's `isOwner` rather than comparing user ids
 * here. Published agents you own appear under *Yours*, not both.
 *
 * No polling. Nothing about an agent changes without a user action in this app,
 * unlike a source whose import completes server-side.
 */
export function useAgents() {
  const workspaceId = useWorkspaceId();

  const query = useQuery({
    queryKey: agentKeys.all(workspaceId),
    queryFn: () => agentsApi.list(),
  });

  const agents = useMemo(() => query.data ?? [], [query.data]);

  const mine = useMemo(() => agents.filter((a) => a.isOwner), [agents]);
  const shared = useMemo(() => agents.filter((a) => !a.isOwner), [agents]);

  const stats = useMemo<Stat[]>(() => {
    const published = agents.filter((a) => a.visibility === "workspace").length;
    const drafts = agents.filter((a) => a.status === "draft").length;
    return [
      { label: "Agents", value: agents.length },
      { label: "Yours", value: mine.length },
      { label: "Published", value: published },
      { label: "Drafts", value: drafts },
    ];
  }, [agents, mine.length]);

  return { ...query, agents, mine, shared, stats };
}

/** One agent, for the builder. `agentId` may be absent while creating. */
export function useAgent(agentId: string | undefined) {
  const workspaceId = useWorkspaceId();

  return useQuery({
    queryKey: agentKeys.detail(workspaceId, agentId ?? "new"),
    queryFn: () => agentsApi.get(agentId as string),
    enabled: Boolean(agentId),
  });
}

/**
 * The agent's version history, proxied from Anthropic on demand.
 *
 * Empty is a normal state, not an error: a draft that has never synced has no
 * history yet. `staleTime` is deliberate — this is a vendor round-trip behind
 * our API, and the list only changes when the user saves.
 */
export function useAgentVersions(agentId: string | undefined) {
  const workspaceId = useWorkspaceId();

  return useQuery({
    queryKey: agentKeys.versions(workspaceId, agentId ?? "new"),
    queryFn: () => agentsApi.versions(agentId as string),
    enabled: Boolean(agentId),
    staleTime: 30_000,
  });
}

/** Sort helper for the two card groups: most recently touched first. */
export function byRecency(a: Agent, b: Agent): number {
  return (b.updatedAt ?? b.createdAt ?? "").localeCompare(a.updatedAt ?? a.createdAt ?? "");
}
