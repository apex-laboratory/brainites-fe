import { useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { skillKeys, skillsApi } from "../api";

/**
 * Registry summary strip (`GET /skills/stats`) — total / stable / in-review /
 * draft / calls·30d. Workspace-keyed. Requires role ≥ viewer, so it loads for
 * every dashboard user.
 */
export function useSkillsStats() {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: skillKeys.stats(workspaceId),
    queryFn: () => skillsApi.stats(),
  });
}
