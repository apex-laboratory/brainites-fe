import { useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { decisionKeys, decisionsApi } from "../api";
import { mapDecision } from "../mappers";
import type { Decision } from "../types";

/**
 * The open decision, read from `GET /decisions/{id}`.
 *
 * The list row is passed in as `fallback` and shown immediately, so opening a
 * decision never flashes a skeleton — the fetch only ever *refines* what's
 * already on screen. That matters because the list is cursor-paginated: a
 * decision loaded several pages ago can be minutes stale by the time it's
 * opened, and this re-reads exactly the one row the user is looking at.
 *
 * A failed detail fetch is deliberately silent. The list row is still accurate
 * enough to render, and an error card over content the user can already see
 * would be a downgrade.
 */
export function useDecision(
  decisionId: string | null,
  fallback: Decision | null,
): { decision: Decision | null; isRefreshing: boolean } {
  const workspaceId = useWorkspaceId();

  const query = useQuery({
    queryKey: decisionKeys.detail(workspaceId, decisionId ?? "idle"),
    queryFn: () => decisionsApi.get(decisionId as string),
    enabled: decisionId !== null,
  });

  // Guard against a response for a decision the user has already navigated off.
  const fresh = query.data && query.data.id === decisionId ? query.data : null;

  return {
    decision: fresh ? mapDecision(fresh) : fallback,
    isRefreshing: query.isFetching,
  };
}
