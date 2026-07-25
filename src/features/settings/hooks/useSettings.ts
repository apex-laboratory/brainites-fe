import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import {
  settingsApi,
  settingsKeys,
  type Settings,
  type UpdateSettingsInput,
} from "../api";

/**
 * Workspace settings read model + partial-update mutation. On a successful
 * PATCH the settings cache is patched in place (name/domain) so the row reflects
 * the change without a refetch; the global mutation `onError` handles failures.
 */
export function useSettings() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: settingsKeys.settings(workspaceId),
    queryFn: () => settingsApi.get(workspaceId),
  });

  const update = useMutation({
    mutationFn: (fields: UpdateSettingsInput) => settingsApi.update(workspaceId, fields),
    onSuccess: (res) => {
      queryClient.setQueryData<Settings>(settingsKeys.settings(workspaceId), (prev) =>
        prev
          ? {
              ...prev,
              workspace: {
                ...prev.workspace,
                name: res.workspace.name,
                domain: res.workspace.domain,
              },
            }
          : prev,
      );
      toast.success("Workspace updated");
    },
  });

  return {
    settings: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    update,
  };
}
