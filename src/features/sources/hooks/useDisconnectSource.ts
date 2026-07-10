import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { isApiError } from "@/lib/api";

import { sourceKeys, sourcesApi, type Source } from "../api";

/**
 * Disconnect a source, optimistically dropping its card from the list so the
 * UI feels instant. On failure the snapshot is restored and the error toasted;
 * `onSettled` refetches so the server stays the source of truth either way.
 */
export function useDisconnectSource() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const key = sourceKeys.all(workspaceId);

  return useMutation({
    mutationFn: (sourceId: string) => sourcesApi.disconnect(sourceId),

    onMutate: async (sourceId) => {
      // Stop an in-flight list refetch from clobbering the optimistic write.
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Source[]>(key);

      queryClient.setQueryData<Source[]>(key, (current) =>
        current?.filter((source) => source.id !== sourceId),
      );

      return { previous };
    },

    onSuccess: () => {
      toast.success("Source disconnected");
    },

    // Overriding `onError` opts out of the global toast, so raise our own.
    onError: (error, _sourceId, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(
        isApiError(error) ? error.message : "Couldn't disconnect that source",
      );
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
