import { useEffect, useState } from "react";

/**
 * Animates a number from 0 up to `target` using requestAnimationFrame.
 * Ported from the prototype: includes a settle fallback for throttled
 * background tabs. When `run` is false it snaps straight to `target`.
 */
export function useCountUp(target: number, run = true, duration = 900): number {
  const [value, setValue] = useState(run ? 0 : target);

  useEffect(() => {
    if (!run) {
      setValue(target);
      return;
    }

    let raf = 0;
    let start: number | null = null;
    let settled = false;

    const step = (t: number) => {
      start ??= t;
      const progress = Math.min(1, (t - start) / duration);
      setValue(Math.round((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) raf = requestAnimationFrame(step);
      else settled = true;
    };

    raf = requestAnimationFrame(step);
    // fallback: rAF is throttled in background tabs — snap to final value
    const fallback = setTimeout(() => {
      if (!settled) setValue(target);
    }, duration + 300);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [target, run, duration]);

  return value;
}
