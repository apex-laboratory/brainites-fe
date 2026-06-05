import type { SourceId } from "@/types/common";

/* ============================================================
   BUILD-BRAIN SCENE — geometry & timing config
   Ported from the prototype (js/brain-scene.jsx). The scene is
   authored against a fixed 1440 x 824 canvas that is centered
   and scaled to fit the viewport (see useStageScale).
   ============================================================ */

export const CANVAS = { w: 1440, h: 824 } as const;

export const CX = 720;
export const CY = 392;
export const RING = 224;

const SRC_LIST: SourceId[] = ["slack", "notion", "github", "jira", "zendesk"];

export type Emitter = { id: SourceId; i: number; x: number; y: number };

/** Five source nodes on the orbit — rotated so the top-center is an open
 * gap (clears the heading) and a node sits at bottom-center instead. */
export const EMITTERS: Emitter[] = SRC_LIST.map((id, i) => {
  const a = ((-54 + i * 72) * Math.PI) / 180;
  return { id, i, x: CX + Math.cos(a) * RING, y: CY + Math.sin(a) * RING };
});

export type Link = Emitter & {
  dx: number;
  dy: number;
  len: number;
  ang: number;
};

/** Connection lines + comet vectors flowing from each node into the core. */
export const LINKS: Link[] = EMITTERS.map((e) => {
  const dx = CX - e.x;
  const dy = CY - e.y;
  return {
    ...e,
    dx,
    dy,
    len: Math.hypot(dx, dy),
    ang: (Math.atan2(dy, dx) * 180) / Math.PI,
  };
});

export type Bloom = {
  title: string;
  sub: string;
  src: SourceId;
  /** card position */
  x: number;
  y: number;
  /** thread anchor (closer to the core) */
  ax: number;
  ay: number;
  /** ms delay before the card blooms */
  at: number;
  /** CSS exit drift */
  drift: string;
};

/** Decision cards that bloom in the open corners around the core. */
export const BLOOMS: Bloom[] = [
  { title: "Premium refund window", sub: "45 days", src: "notion", x: 296, y: 250, at: 1300, drift: "-20px", ax: 470, ay: 300 },
  { title: "Dispute escalation", sub: "→ #cs-escalations", src: "slack", x: 936, y: 250, at: 2050, drift: "18px", ax: 952, ay: 300 },
  { title: "Incident ownership", sub: "on-call EM @ 30m", src: "jira", x: 962, y: 548, at: 2800, drift: "22px", ax: 978, ay: 556 },
  { title: "Enterprise discount", sub: ">20% → VP Finance", src: "slack", x: 296, y: 548, at: 3450, drift: "-18px", ax: 484, ay: 556 },
];

/** Thread geometry from a bloom's anchor to the core. */
export function bloomThread(b: Bloom) {
  const dx = CX - b.ax;
  const dy = CY - b.ay;
  return { len: Math.hypot(dx, dy), ang: (Math.atan2(dy, dx) * 180) / Math.PI };
}

export type Phase = { at: number; label: string; line: string };

/** Phased status copy, advanced on a timer. */
export const PHASES: Phase[] = [
  { at: 0, label: "Reading your sources", line: "Ingesting Slack, Notion, GitHub, Jira & Zendesk" },
  { at: 1700, label: "Extracting decisions", line: "Finding the calls your team already made" },
  { at: 3200, label: "Writing policies & skills", line: "Turning decisions into executable knowledge" },
  { at: 4700, label: "Mapping relationships", line: "Connecting people, sources & outcomes" },
];

export type AmbientOrb = { x: string; y: string; size: number; color: string; dur: number };

/** Drifting ambient light orbs for depth (positioned within the canvas). */
export const AMBIENT: AmbientOrb[] = [
  { x: "18%", y: "26%", size: 360, color: "rgba(255,186,130,0.9)", dur: 14 },
  { x: "76%", y: "30%", size: 300, color: "rgba(255,120,60,0.8)", dur: 18 },
  { x: "30%", y: "74%", size: 320, color: "rgba(255,150,90,0.7)", dur: 16 },
  { x: "70%", y: "72%", size: 280, color: "rgba(255,200,150,0.7)", dur: 20 },
];

/** Final ledger totals shown when the build completes. */
export const LEDGER = {
  sources: 2847,
  decisions: 184,
  policies: 52,
  skills: 37,
} as const;

/** Total build duration before the scene resolves to the "ready" state. */
export const BUILD_TOTAL_MS = 6400;
