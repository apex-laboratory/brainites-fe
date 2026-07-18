import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { isSweepTerminal, onboardingApi, onboardingKeys, type Sweep } from "../api";

/**
 * Drives the "Building your brain…" step against the real sweep endpoints:
 * fires `POST /sweeps` once on mount (idempotent server-side), then polls
 * `GET /sweeps/{id}` until the sweep reaches a terminal state.
 *
 * If the start call fails — e.g. the workspace has no connected sources yet —
 * the step is not blocked: `failed` is surfaced so the caller can move on
 * (there's simply nothing to build until sources are connected).
 */
export function useBrainBuild() {
  const workspaceId = useWorkspaceId();
  const [sweepId, setSweepId] = useState<string | null>(null);
  const started = useRef(false);

  const start = useMutation({
    mutationFn: () => onboardingApi.startSweep(),
    onSuccess: (sweep) => setSweepId(sweep.id),
    // Swallow the toast: a failed/empty build shouldn't nag; the step handles it.
    onError: () => {},
  });

  // Fire exactly once. A ref (not deps) guards against StrictMode's double-mount.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const poll = useQuery({
    queryKey: onboardingKeys.sweep(workspaceId, sweepId ?? "idle"),
    queryFn: () => onboardingApi.getSweep(sweepId as string),
    enabled: sweepId !== null,
    refetchInterval: (query) => {
      const data = query.state.data as Sweep | undefined;
      return data && isSweepTerminal(data) ? false : 1500;
    },
  });

  // Prefer the freshest poll data; fall back to the start response.
  const sweep = poll.data ?? start.data;
  const done = sweep ? isSweepTerminal(sweep) : false;

  return {
    sweep,
    done,
    /** The build couldn't start (e.g. no connected sources) — safe to skip. */
    failed: start.isError,
    isStarting: start.isPending,
  };
}
