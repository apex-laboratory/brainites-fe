import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useAuth } from "@/app/providers/AuthProvider";
import { isApiError } from "@/lib/api";

import {
  isSweepTerminal,
  onboardingApi,
  onboardingKeys,
  sweepFailures,
  sweepProviders,
  type Sweep,
  type SweepProviderProgress,
} from "../api";
import { useActiveSweep } from "./useActiveSweep";

/** Poll cadence. The backend has no rate limit here; 2.5s stays inside the
 * brief's 2–3s window and well clear of the "never faster than 1/s" floor. */
const POLL_MS = 2_500;

/** Stop polling after this long and tell the user to come back later — a large
 * workspace can legitimately outlive any timeout we'd pick. */
const MAX_POLL_MS = 15 * 60_000;

/** Consecutive unchanged polls before extraction counts count as settled. */
const SETTLE_POLLS = 3;

/**
 * Where the build has got to. Split out from raw sweep `status` because two of
 * these phases have no server-side equivalent: `extracting` is a *terminal*
 * sweep whose skill counts are still climbing, and `timedOut` is purely a
 * client-side give-up.
 */
export type SweepPhase =
  | "checking"
  | "idle"
  | "starting"
  | "ingesting"
  | "extracting"
  | "done"
  | "timedOut"
  | "forbidden"
  | "error";

export interface OnboardingSweepState {
  phase: SweepPhase;
  sweep: Sweep | undefined;
  /** Per-provider rows for the progress list (empty while pending). */
  providers: SweepProviderProgress[];
  /** Providers that failed — present even when the sweep itself completed. */
  failures: SweepProviderProgress[];
  /** Start the sweep. No-op once one is in flight. */
  start: () => void;
  /** Re-attempt after a failed start. */
  retry: () => void;
  /** True when the build was picked up from `/sweeps/active`, not started here. */
  resumed: boolean;
  /** The start failure, for inline rendering. */
  error: unknown;
}

/**
 * Owns the onboarding sweep end to end: resume, start, poll, settle, give up.
 *
 * Four behaviours here exist because the obvious implementation gets them
 * wrong:
 *
 *  1. **Nothing auto-starts.** `POST /sweeps` fires only from `start()`, so the
 *     caller can gate it behind an explicit CTA and a connected source.
 *  2. **`completed` is not done.** Ingestion finishing kicks off a separate
 *     batched extraction phase, so `skillsCreated`/`skillsQueued` keep climbing
 *     afterwards. Polling continues through `extracting` until those counts hold
 *     still, otherwise the user lands on an empty review queue.
 *  3. **Settling is measured per fetch, not per render.** React Query preserves
 *     the data object when a response is deeply equal, so counting "unchanged"
 *     off the sweep object alone would never advance. The check is keyed on
 *     `dataUpdatedAt`, which moves on every completed poll.
 *  4. **A failed `/sweeps/active` is not fatal.** If that endpoint is missing or
 *     erroring we fall through to the normal start flow rather than blocking
 *     onboarding — except for a 403, which is a real answer about the user.
 */
export function useOnboardingSweep(): OnboardingSweepState {
  const { workspaceId } = useAuth();
  const active = useActiveSweep();

  const [sweepId, setSweepId] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const pollStartedAt = useRef<number | null>(null);
  const lastCounts = useRef<string | null>(null);
  const stableTicks = useRef(0);

  // ── resume an in-flight sweep ─────────────────────────────────────────────
  useEffect(() => {
    if (!active.sweep || sweepId) return;
    setSweepId(active.sweep.id);
    setResumed(true);
    pollStartedAt.current = Date.now();
  }, [active.sweep, sweepId]);

  // ── start ─────────────────────────────────────────────────────────────────
  const startMutation = useMutation({
    mutationFn: () => onboardingApi.startSweep(),
    onSuccess: (sweep) => {
      setSweepId(sweep.id);
      pollStartedAt.current = Date.now();
    },
    // Rendered inline on the step — a full-screen build failing is not a toast.
    meta: { errorToast: false },
  });

  const { mutate: startSweep, reset: resetStart } = startMutation;

  const start = useCallback(() => {
    if (sweepId || startMutation.isPending) return;
    startSweep();
  }, [sweepId, startMutation.isPending, startSweep]);

  const retry = useCallback(() => {
    resetStart();
    // Deliberately bypasses `start`'s in-flight guard: retrying after a dead
    // poll means re-asking for the sweep id, and `POST /sweeps` is idempotent —
    // it hands back the running sweep rather than starting a second one.
    startSweep();
  }, [resetStart, startSweep]);

  // ── poll ──────────────────────────────────────────────────────────────────
  const poll = useQuery({
    queryKey: onboardingKeys.sweep(workspaceId ?? "none", sweepId ?? "idle"),
    queryFn: () => onboardingApi.getSweep(sweepId as string),
    enabled: sweepId !== null && !settled && !timedOut,
    refetchInterval: POLL_MS,
    // A dead sweep id shouldn't retry-storm; the phase machine handles it.
    retry: false,
  });

  const sweep = poll.data ?? startMutation.data ?? active.sweep ?? undefined;

  // ── settle: keep polling until the extraction counts stop moving ──────────
  const pollUpdatedAt = poll.dataUpdatedAt;
  useEffect(() => {
    if (!pollUpdatedAt || settled) return;
    const current = poll.data;
    if (!current) return;

    // Still ingesting — extraction hasn't even been queued yet.
    if (!isSweepTerminal(current)) {
      lastCounts.current = null;
      stableTicks.current = 0;
      return;
    }

    const counts = `${current.skillsCreated}:${current.skillsQueued}`;
    if (counts === lastCounts.current) {
      stableTicks.current += 1;
      if (stableTicks.current >= SETTLE_POLLS) setSettled(true);
    } else {
      lastCounts.current = counts;
      stableTicks.current = 0;
    }
    // Keyed on `dataUpdatedAt` so this runs once per completed poll — see (3).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollUpdatedAt, settled]);

  // ── give up after 15 minutes ──────────────────────────────────────────────
  useEffect(() => {
    if (sweepId === null || settled || timedOut) return;
    const startedAt = pollStartedAt.current ?? Date.now();
    const remaining = MAX_POLL_MS - (Date.now() - startedAt);
    if (remaining <= 0) {
      setTimedOut(true);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), remaining);
    return () => clearTimeout(timer);
  }, [sweepId, settled, timedOut]);

  // ── phase ─────────────────────────────────────────────────────────────────
  const forbidden =
    (isApiError(startMutation.error) && startMutation.error.status === 403) ||
    (isApiError(poll.error) && poll.error.status === 403) ||
    (isApiError(active.error) && active.error.status === 403);

  // A poll that has never once succeeded means the id we're holding is unusable
  // (a 404 from a bad or foreign sweep id). Say so now rather than spinning for
  // fifteen minutes against an endpoint that will never answer. Once a poll has
  // succeeded, later failures are treated as transient: the last known progress
  // stays on screen and the timeout is the backstop.
  const pollDead = poll.isError && poll.data === undefined;

  const phase: SweepPhase = forbidden
    ? "forbidden"
    : active.isPending
      ? "checking"
      : timedOut
        ? "timedOut"
        : settled
          ? "done"
          : pollDead
            ? "error"
            : sweep
              ? isSweepTerminal(sweep)
                ? "extracting"
                : "ingesting"
              : startMutation.isPending
                ? "starting"
                : startMutation.isError
                  ? "error"
                  : "idle";

  const providers = useMemo(
    () => (sweep ? sweepProviders(sweep) : []),
    [sweep],
  );
  const failures = useMemo(() => (sweep ? sweepFailures(sweep) : []), [sweep]);

  return {
    phase,
    sweep,
    providers,
    failures,
    start,
    retry,
    resumed,
    error: startMutation.error ?? (pollDead ? poll.error : null),
  };
}
