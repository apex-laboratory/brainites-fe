import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api";

import { agentKeys, agentsApi, type Agent, type AgentCreateBody, type AgentUpdateBody } from "../api";

/**
 * A save failure the user can actually act on, separated from the ones they
 * cannot. `conflict` means reload; `notConfigured` is a deployment state.
 */
export function describeSaveError(error: unknown): { title: string; description: string } {
  if (error instanceof ApiError && error.status === 409) {
    return {
      title: "This agent changed while you were editing",
      description: "Someone else saved it. Reload to see their version, then re-apply your edit.",
    };
  }
  if (error instanceof ApiError && error.status === 501) {
    // The agent runtime isn't configured on the server. Saying "try again"
    // would be a lie — nothing the user does will fix it.
    return {
      title: "The agent runtime isn't set up yet",
      description: "This workspace can't create agents until an Anthropic key is configured.",
    };
  }
  if (error instanceof ApiError && error.status === 502) {
    return {
      title: "The agent runtime is unavailable",
      description: "Anthropic didn't respond. Your changes weren't saved — try again shortly.",
    };
  }
  return { title: "Couldn't save this agent", description: "Your changes weren't saved." };
}

/**
 * Create an agent, then go to its builder.
 *
 * No optimistic update: creating provisions a real object on Anthropic, and
 * showing a card for an agent that failed to provision would be a lie the user
 * only discovers when they open it.
 */
export function useCreateAgent() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (body: AgentCreateBody) => agentsApi.create(body),

    onSuccess: (agent) => {
      queryClient.setQueryData(agentKeys.detail(workspaceId, agent.id), agent);
      void queryClient.invalidateQueries({ queryKey: agentKeys.all(workspaceId), exact: true });
      toast.success("Agent created");
      navigate(ROUTES.agentDetail(agent.id));
    },

    onError: (error) => {
      const { title, description } = describeSaveError(error);
      toast.error(title, { description });
    },
  });
}

/**
 * Save an existing agent.
 *
 * Pass only the fields that changed. The backend reads the body with
 * `exclude_unset`, and sending the whole form back mints an Anthropic version
 * for a save that changed nothing — versions are the agent's audit trail, so
 * filling it with no-ops makes rollback useless.
 *
 * `version` rides along for optimistic concurrency; a 409 means someone else
 * saved first.
 */
export function useUpdateAgent(agentId: string) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AgentUpdateBody) => agentsApi.update(agentId, body),

    onSuccess: (agent) => {
      queryClient.setQueryData(agentKeys.detail(workspaceId, agent.id), agent);
      void queryClient.invalidateQueries({ queryKey: agentKeys.all(workspaceId), exact: true });
      // The version list only changes when a runtime field did, but the server
      // is the one that knows which — so refresh rather than guess.
      void queryClient.invalidateQueries({ queryKey: agentKeys.versions(workspaceId, agent.id) });
      toast.success("Saved");
    },

    onError: (error) => {
      const { title, description } = describeSaveError(error);
      toast.error(title, { description });
    },
  });
}

/**
 * Publish to the workspace, or take it back private.
 *
 * Optimistic: visibility is ours alone — no Anthropic round-trip — so the
 * toggle should feel instant, and a failure rolls back to the server's value.
 */
export function useSetVisibility(agentId: string) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const key = agentKeys.detail(workspaceId, agentId);

  return useMutation({
    mutationFn: (publish: boolean) =>
      publish ? agentsApi.publish(agentId) : agentsApi.unpublish(agentId),

    onMutate: async (publish) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Agent>(key);
      if (previous) {
        queryClient.setQueryData<Agent>(key, {
          ...previous,
          visibility: publish ? "workspace" : "private",
        });
      }
      return { previous };
    },

    onError: (_error, _publish, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error("Couldn't change who can see this agent");
    },

    onSuccess: (agent) => {
      toast.success(
        agent.visibility === "workspace" ? "Published to your workspace" : "Back to private",
      );
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({ queryKey: agentKeys.all(workspaceId), exact: true });
    },
  });
}
