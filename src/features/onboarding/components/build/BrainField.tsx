import { memo } from "react";
import type { CSSProperties } from "react";

import { SourceIcon } from "@/components/shared/SourceIcon";
import { SOURCES } from "@/constants/sources";

import { AMBIENT, BLOOMS, EMITTERS, LINKS, RING, bloomThread } from "./scene";

/** Custom-property style helper (typed escape hatch for CSS variables). */
type VarStyle = CSSProperties & Record<`--${string}`, string | number>;

/**
 * The static animated field: ambient light, orbit rings, connection lines,
 * energy comets, source nodes, and the blooming decision cards. Memoized so
 * it mounts once and its CSS animations run uninterrupted by the parent's
 * timed re-renders.
 */
export const BrainField = memo(function BrainField({ reduced }: { reduced: boolean }) {
  return (
    <>
      {/* ambient light orbs */}
      {AMBIENT.map((o, i) => (
        <div
          key={`amb-${i}`}
          className="bb-amb"
          style={{
            left: o.x,
            top: o.y,
            width: o.size,
            height: o.size,
            background: `radial-gradient(circle, ${o.color}, transparent 68%)`,
            animation: reduced ? undefined : `bb-orb-drift ${o.dur}s ease-in-out ${i * 1.3}s infinite`,
          }}
        />
      ))}

      {/* orbit guide rings */}
      <div
        className="bb-orbit"
        style={{ width: RING * 2, height: RING * 2, animation: reduced ? undefined : "bb-orbit-spin 60s linear infinite" }}
      />
      <div
        className="bb-orbit"
        style={{
          width: RING * 2 - 120,
          height: RING * 2 - 120,
          borderColor: "rgba(255,255,255,0.10)",
          animation: reduced ? undefined : "bb-orbit-spin-r 46s linear infinite",
        }}
      />
      <div
        className="bb-orbit"
        style={{
          width: RING * 2 + 140,
          height: RING * 2 + 140,
          borderColor: "rgba(255,255,255,0.07)",
          animation: reduced ? undefined : "bb-orbit-spin 80s linear infinite",
        }}
      />

      {/* faint guide lines from each node into the core */}
      {LINKS.map((l) => (
        <div
          key={`line-${l.i}`}
          className="bb-line"
          style={{ left: l.x, top: l.y, width: l.len, transform: `rotate(${l.ang}deg)` }}
        />
      ))}

      {/* energy comets flowing toward the core (skipped under reduced motion) */}
      {!reduced &&
        LINKS.map((l) =>
          [0, 1, 2].map((k) => (
            <div
              key={`comet-${l.i}-${k}`}
              className="bb-comet"
              style={
                {
                  left: l.x,
                  top: l.y,
                  "--dx": `${l.dx}px`,
                  "--dy": `${l.dy}px`,
                  animation: `bb-flow-comet ${1.7 + (l.i % 3) * 0.3}s linear ${l.i * 0.14 + k * 0.55}s infinite`,
                } as VarStyle
              }
            >
              <span className="bb-comet-dot" style={{ width: k === 1 ? 7 : 5, height: k === 1 ? 7 : 5 }} />
            </div>
          ))
        )}

      {/* source nodes on the ring */}
      {EMITTERS.map((e, idx) => (
        <div key={`node-${e.id}`} className="bb-node-anchor" style={{ left: e.x, top: e.y }}>
          <div
            className="bb-node-float"
            style={{ animation: reduced ? undefined : `bb-node-float ${4 + idx * 0.4}s ease-in-out ${idx * 0.3}s infinite` }}
          >
            <div className="bb-node">
              <SourceIcon id={e.id} size={30} branded />
            </div>
            <div className="bb-node-label">{SOURCES[e.id].name}</div>
          </div>
        </div>
      ))}

      {/* blooming decision cards + threads to the core */}
      {BLOOMS.map((b, i) => {
        const { len, ang } = bloomThread(b);
        const delay = `${b.at / 1000}s`;
        return (
          <div key={`bloom-${i}`}>
            <div
              className="bb-thread"
              style={{
                left: b.ax,
                top: b.ay,
                width: len,
                transform: `rotate(${ang}deg)`,
                animationDelay: reduced ? undefined : delay,
                animation: reduced ? "none" : undefined,
              }}
            />
            <div
              className="bb-card"
              style={
                {
                  left: b.x,
                  top: b.y,
                  "--drift": b.drift,
                  animationDelay: reduced ? undefined : delay,
                  // static, fully visible card when motion is reduced
                  animation: reduced ? "none" : undefined,
                  opacity: reduced ? 1 : undefined,
                } as VarStyle
              }
            >
              <div className="bb-card-row">
                <SourceIcon id={b.src} size={16} branded />
                <span className="bb-card-title">{b.title}</span>
              </div>
              <div className="bb-card-sub">{b.sub}</div>
            </div>
          </div>
        );
      })}
    </>
  );
});
