import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { optimisticRemove, rollbackRemove } from "@/lib/api";

import { sourceKeys, sourcesApi, type Source } from "../api";

/**
 * Disconnect a source, optimistically dropping its card from the list so the
 * UI feels instant. On failure the snapshot is restored and `meta` supplies the
 * copy for the global error toast;
 * `onSettled` refetches so the server stays the source of truth either way.
 */
export function useDisconnectSource() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const key = sourceKeys.all(workspaceId);

  return useMutation({
    mutationFn: (sourceId: string) => sourcesApi.disconnect(sourceId),

    onMutate: (sourceId) => optimisticRemove<Source>(queryClient, key, [sourceId]),

    onSuccess: () => {
      toast.success("Source disconnected");
    },

    // State only — the toast is the global handler's job (see `meta`).
    onError: (_error, _sourceId, context) => rollbackRemove(queryClient, key, context),

    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),

    meta: { errorMessage: "Couldn't disconnect that source" },
  });
}
