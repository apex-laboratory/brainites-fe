import { useEffect, useState } from "react";

/** Time spent on each checklist item before it resolves. */
const STEP_MS = 1150;

/**
 * Drives the "Learning your world" checklist: completes `count` items one at a
 * time on a timer. Reduced-motion users land on the finished state instantly.
 */
export function useLearningProgress(count: number, reducedMotion: boolean) {
  const [completed, setCompleted] = useState(reducedMotion ? count : 0);

  useEffect(() => {
    if (reducedMotion || completed >= count) return;
    const timer = setTimeout(() => setCompleted((c) => c + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [completed, count, reducedMotion]);

  return { completed, done: completed >= count };
}
