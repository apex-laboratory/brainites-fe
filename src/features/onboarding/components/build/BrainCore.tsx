import brandMark from "@/assets/brand/brainite-exports/favicon-transparent.png";

import { CX, CY } from "./scene";

/**
 * Central glass orb housing the Brainite mark. The provided transparent
 * logo asset is used directly for the center mark (no inline SVG).
 */
export function BrainCore({ done }: { done: boolean }) {
  return (
    <div className="bb-core-wrap" style={{ left: CX, top: CY }}>
      {/* soft outer halo */}
      <div className="bb-halo" />

      {/* expanding pulse rings */}
      {[0, 1, 2].map((i) => (
        <span key={i} className="bb-ring" style={{ animationDelay: `${i}s` }} />
      ))}

      {/* glass sphere */}
      <div className="bb-core">
        <span className="bb-core-gloss" />
        <img src={brandMark} alt="" className="bb-core-mark" />
        {done && <span className="bb-core-flash" />}
      </div>
    </div>
  );
}
