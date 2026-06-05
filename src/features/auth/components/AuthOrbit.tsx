import { SourceIcon } from "@/components/shared/SourceIcon";
import { AppIcon } from "@/components/shared/AppIcon";
import { SOURCE_ORDER } from "@/constants/sources";
import type { SourceId } from "@/types/common";

/**
 * Decorative orbiting-source constellation for the auth brand panel.
 * Built from positioned divs (rings, connector lines, source nodes, core)
 * — no inline icon SVG. Motion is gentle and respects reduced-motion via
 * the global media query.
 */

const SIZE = 460;
const R1 = 132;
const R2 = 196;

type OrbitNode = { id: SourceId; x: number; y: number; angle: number; radius: number };

function place(ids: SourceId[], radius: number, offsetDeg: number): OrbitNode[] {
  return ids.map((id, i) => {
    const angle = ((offsetDeg + i * (360 / ids.length)) * Math.PI) / 180;
    return {
      id,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      angle: (offsetDeg + i * (360 / ids.length)),
      radius,
    };
  });
}

const NODES: OrbitNode[] = [
  ...place(SOURCE_ORDER.slice(0, 3), R1, -90),
  ...place(SOURCE_ORDER.slice(3), R2, 30),
];

export function AuthOrbit() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* warm glow */}
      <div
        className="absolute"
        style={{
          right: "-12%",
          top: "42%",
          width: 560,
          height: 560,
          transform: "translateY(-50%)",
          background:
            "radial-gradient(circle, rgba(232,72,27,0.34), transparent 62%)",
          filter: "blur(20px)",
        }}
      />

      <div
        className="absolute"
        style={{
          right: -210,
          top: "50%",
          transform: "translateY(-50%)",
          width: SIZE,
          height: SIZE,
        }}
      >
        {/* rings */}
        <div
          className="absolute rounded-full border border-white/[0.10]"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: R1 * 2,
            height: R1 * 2,
          }}
        />
        <div
          className="absolute rounded-full border border-white/[0.07]"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: R2 * 2,
            height: R2 * 2,
          }}
        />

        {/* connector lines */}
        {NODES.map((n) => (
          <div
            key={`line-${n.id}`}
            className="absolute bg-white/10"
            style={{
              left: "50%",
              top: "50%",
              height: 1,
              width: n.radius,
              transformOrigin: "left center",
              transform: `rotate(${n.angle}deg)`,
            }}
          />
        ))}

        {/* core */}
        <div
          className="absolute grid place-items-center rounded-full motion-safe:animate-[core-pulse_3s_var(--ease-in-out)_infinite]"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: 84,
            height: 84,
            background:
              "radial-gradient(circle at 36% 30%, #fff, #FFE2D2 72%)",
            boxShadow:
              "0 0 0 8px rgba(255,255,255,0.06), 0 18px 50px rgba(120,28,2,0.5)",
          }}
        >
          <AppIcon name="brain" size={34} className="text-primary" />
        </div>

        {/* source nodes */}
        {NODES.map((n, i) => (
          <div
            key={n.id}
            className="absolute motion-safe:animate-[node-float_var(--dur)_ease-in-out_infinite]"
            style={
              {
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${n.x}px), calc(-50% + ${n.y}px))`,
                ["--dur" as string]: `${4 + i * 0.5}s`,
                animationDelay: `${i * 0.3}s`,
              } as React.CSSProperties
            }
          >
            <div
              className="grid size-11 place-items-center rounded-[13px] bg-white/95"
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
            >
              <SourceIcon id={n.id} size={24} branded />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
