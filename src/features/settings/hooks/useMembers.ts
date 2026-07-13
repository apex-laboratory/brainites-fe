import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { queryClient } from "@/lib/api";

import { ROLE_LABEL, settingsApi, settingsKeys, type InviteInput } from "../api";

/**
 * Workspace roster read model + invite mutation. An invite creates a *pending*
 * invitation (not a member), so the roster is invalidated rather than mutated —
 * a re-listed member only appears once the invitee accepts.
 */
export function useMembers() {
  const workspaceId = useWorkspaceId();

  const query = useQuery({
    queryKey: settingsKeys.members(workspaceId),
    queryFn: () => settingsApi.members(workspaceId),
  });

  const invite = useMutation({
    mutationFn: (body: InviteInput) => settingsApi.invite(workspaceId, body),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.members(workspaceId) });
      toast.success("Invitation sent", {
        description: `${res.email} was invited as ${ROLE_LABEL[res.role]}.`,
      });
    },
  });

  return {
    members: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invite,
  };
}
