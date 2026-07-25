import { useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { skillKeys, skillsApi } from "../api";

/**
 * One skill's full body (`GET /skills/{id}`) plus its version history
 * (`GET /skills/{id}/versions`).
 *
 * Two queries rather than one so the body — the part the reader came for —
 * paints as soon as it arrives instead of waiting on the history. They're keyed
 * separately, so opening the same skill twice re-serves both from cache.
 *
 * Pass `null` to keep both idle (the dialog is closed).
 */
export function useSkill(skillId: string | null) {
  const workspaceId = useWorkspaceId();
  const enabled = skillId !== null;

  const detail = useQuery({
    queryKey: skillKeys.detail(workspaceId, skillId ?? "idle"),
    queryFn: () => skillsApi.get(skillId as string),
    enabled,
  });

  const versions = useQuery({
    queryKey: skillKeys.versions(workspaceId, skillId ?? "idle"),
    queryFn: () => skillsApi.versions(skillId as string),
    enabled,
  });

  return {
    skill: detail.data ?? null,
    /** Newest first — the backend orders oldest-first from `skill_versions`. */
    versions: [...(versions.data ?? [])].reverse(),
    isPending: detail.isPending,
    isError: detail.isError,
    error: detail.error,
    /** History can fail on its own without costing the reader the skill body. */
    versionsFailed: versions.isError,
    isLoadingVersions: versions.isPending,
    refetch: () => {
      void detail.refetch();
      void versions.refetch();
    },
  };
}
