import { useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { sourceKeys, sourcesApi } from "../api";

/**
 * What a source read, what became knowledge, and why the rest didn't.
 *
 * Pass `null` to keep the query idle (dialog closed) — the Sources page renders
 * a grid of cards, and an eager query here would fire one aggregate request per
 * source on mount. Same shape as {@link useSourceChannels}.
 */
export function useSourceReport(sourceId: string | null) {
  const workspaceId = useWorkspaceId();

  return useQuery({
    queryKey: sourceKeys.report(workspaceId, sourceId ?? "idle"),
    queryFn: () => sourcesApi.report(sourceId as string),
    enabled: sourceId !== null,
  });
}
