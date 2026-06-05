import { useEffect, useState } from "react";

import { BUILD_TOTAL_MS, PHASES } from "@/features/onboarding/components/build/scene";

export type BrainBuildState = {
  phaseLabel: string;
  phaseLine: string;
  /** Drives the count-up of each ledger group as its phase begins. */
  runSources: boolean;
  runDecisions: boolean;
  runPolicies: boolean;
  /** Scene has resolved to the "brain ready" finale. */
  done: boolean;
};

/**
 * Owns the build-brain scene's discrete timed state. Continuous motion is
 * handled by CSS; this hook only flips the few state values that gate phase
 * copy, ledger count-ups, and the completion finale.
 *
 * When `reducedMotion` is true the scene resolves to its finished state up
 * front so the user still gets a usable, static "brain ready" screen.
 */
export function useBrainBuild(reducedMotion: boolean): BrainBuildState {
  const [phaseIndex, setPhaseIndex] = useState(reducedMotion ? PHASES.length - 1 : 0);
  const [runSources, setRunSources] = useState(reducedMotion);
  const [runDecisions, setRunDecisions] = useState(reducedMotion);
  const [runPolicies, setRunPolicies] = useState(reducedMotion);
  const [done, setDone] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;

    const timers: number[] = [];
    PHASES.forEach((phase, i) => {
      if (i > 0) timers.push(window.setTimeout(() => setPhaseIndex(i), phase.at));
    });
    timers.push(window.setTimeout(() => setRunSources(true), 200));
    timers.push(window.setTimeout(() => setRunDecisions(true), 1700));
    timers.push(window.setTimeout(() => setRunPolicies(true), 3200));
    timers.push(window.setTimeout(() => setDone(true), BUILD_TOTAL_MS));

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [reducedMotion]);

  const phase = PHASES[phaseIndex];
  return {
    phaseLabel: phase.label,
    phaseLine: phase.line,
    runSources,
    runDecisions,
    runPolicies,
    done,
  };
}
