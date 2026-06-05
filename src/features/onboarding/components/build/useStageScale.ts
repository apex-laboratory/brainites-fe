import { useEffect, useState } from "react";

import { CANVAS } from "./scene";

/**
 * Scales the fixed 1440 x 824 scene canvas to fit the current viewport.
 * Genuine external subscription (window resize) — not derived state.
 */
export function useStageScale(): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const compute = () => {
      const fit = Math.min(window.innerWidth / CANVAS.w, window.innerHeight / CANVAS.h);
      setScale(Math.max(0.5, Math.min(1.15, fit)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return scale;
}
