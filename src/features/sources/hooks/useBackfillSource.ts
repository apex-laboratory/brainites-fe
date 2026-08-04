import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { sourceKeys, sourcesApi } from "../api";

/**
 * Import one source's history.
 *
 * Connecting a source registers the connection but ingests nothing — historical
 * backfill is a separate sweep. Sources connected during onboarding get one from
 * the wizard and dashboard connects now get one automatically, so this is the
 * recovery path: connections made before that existed, and imports that failed.
 *
 * No optimistic update. The button's state is driven by `syncStatus`/
 * `needsBackfill` from the server, and `useSources` polls while anything is
 * importing, so the refetch here is what flips the card into its importing
 * state — inventing that locally would let it disagree with the backend if the
 * import were rejected.
 */
export function useBackfillSource() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) => sourcesApi.backfill(sourceId),

    onSuccess: () => {
      toast.success("Importing history", {
        description: "We'll pull in this source's past and add what we learn to review.",
      });
    },

    // `exact`: the list key is a prefix of every channels key, and a history
    // import doesn't change which channels exist.
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: sourceKeys.all(workspaceId), exact: true }),

    meta: { errorMessage: "Couldn't start that import" },
  });
}
