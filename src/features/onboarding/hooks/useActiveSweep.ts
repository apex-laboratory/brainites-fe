import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/app/providers/AuthProvider";

import { onboardingApi, onboardingKeys } from "../api";

/**
 * `GET /sweeps/active` — the in-flight sweep for this workspace, or `null`.
 *
 * Read on every onboarding page load so a reload mid-build resumes straight
 * back into "Building your brain…". Because the server owns the answer, the
 * client never persists a sweep id anywhere.
 *
 * Deliberately workspace-*optional*: onboarding renders from the welcome step,
 * before `POST /workspaces` has run, so `useWorkspaceId()` would throw here.
 * The query simply stays disabled until a workspace exists.
 *
 * Always refetched on mount — a cached "no active sweep" from earlier in the
 * session would defeat the entire point of the endpoint.
 */
export function useActiveSweep() {
  const { workspaceId } = useAuth();

  const query = useQuery({
    queryKey: onboardingKeys.activeSweep(workspaceId ?? "none"),
    queryFn: () => onboardingApi.activeSweep(),
    enabled: workspaceId !== null,
    staleTime: 0,
    refetchOnMount: "always",
    // A 403 (non-admin) or a 404 (endpoint not deployed) is a final answer, not
    // something to hammer.
    retry: false,
  });

  return {
    /** The active sweep, or `null` when none is running. */
    sweep: query.data ?? null,
    isPending: workspaceId !== null && query.isPending,
    error: query.error,
  };
}
