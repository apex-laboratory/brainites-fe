import { useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { dashboardApi, dashboardKeys } from "../api";

/**
 * Measured usage counters for the settings Usage tab and the sidebar meter.
 *
 * There is no quota system behind this — the payload is counts, not a
 * percentage of an allowance — so consumers render absolute numbers and must
 * not derive a "% of limit" from them. Cached for a minute: usage is a trailing
 * 30-day aggregate, not something worth refetching on every mount.
 */
export function useUsage() {
  const workspaceId = useWorkspaceId();

  const query = useQuery({
    queryKey: dashboardKeys.usage(workspaceId),
    queryFn: () => dashboardApi.usage(workspaceId),
    staleTime: 60 * 1000,
  });

  return {
    usage: query.data ?? null,
    isPending: query.isPending,
    isError: query.isError,
  };
}
