/* ============================================================
   HEPHAESTOU V2 — BUILD-YOUR-BRAIN CINEMATIC SCENE  (v2)
   Orbital source nodes · energy comets flowing into a glass
   brain core · drifting ambient light · bloom-flash finish.
   Canvas reference 1440 x 824 (centered in viewport).
   ============================================================ */

const CX = 720, CY = 392, RING = 224;
const SRC_LIST = ["slack", "notion", "github", "jira", "zendesk"];

/* five source nodes on the orbit — rotated so the TOP center is an open
   gap (clears the heading); a node sits at bottom center instead. */
const EMITTERS = SRC_LIST.map((id, i) => {
  const a = (-54 + i * 72) * Math.PI / 180;
  return { id, i, x: CX + Math.cos(a) * RING, y: CY + Math.sin(a) * RING };
});

/* decision cards that bloom in the open corners around the core (CSS-timed) */
const BLOOMS = [
  { t: "Premium refund window", s: "45 days",            src: "notion",  x: 296, y: 250, at: 1300, drift: "-20px", ax: 470, ay: 300 },
  { t: "Dispute escalation",    s: "→ #cs-escalations",  src: "slack",   x: 936, y: 250, at: 2050, drift: "18px",  ax: 952, ay: 300 },
  { t: "Incident ownership",    s: "on-call EM @ 30m",   src: "jira",    x: 962, y: 548, at: 2800, drift: "22px",  ax: 978, ay: 556 },
  { t: "Enterprise discount",   s: ">20% → VP Finance",  src: "slack",   x: 296, y: 548, at: 3450, drift: "-18px", ax: 484, ay: 556 },
];

const PHASES = [
  { at: 0,    mono: "READING YOUR SOURCES",     line: "Ingesting Slack, Notion, GitHub, Jira & Zendesk" },
  { at: 1700, mono: "EXTRACTING DECISIONS",      line: "Finding the calls your team already made" },
  { at: 3200, mono: "WRITING POLICIES & SKILLS", line: "Turning decisions into executable knowledge" },
  { at: 4700, mono: "MAPPING RELATIONSHIPS",     line: "Connecting people, sources & outcomes" },
];

/* ---- CSS connection lines + glowing comets flowing into the core ---- */
const LINKS = EMITTERS.map((e) => {
  const dx = CX - e.x, dy = CY - e.y;
  return { ...e, dx, dy, len: Math.hypot(dx, dy), ang: Math.atan2(dy, dx) * 180 / Math.PI };
});

const Connections = React.memo(function Connections() {
  return (
    <>
      {/* faint guide lines (always visible) */}
      {LINKS.map((l) => (
        <div key={`ln${l.i}`} style={{ position: "absolute", left: l.x, top: l.y, width: l.len, height: 1, zIndex: 2,
          transformOrigin: "0 50%", transform: `rotate(${l.ang}deg)`,
          background: "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.34))" }}/>
      ))}
      {/* comets: each link emits a stream of glowing dots toward the core */}
      {LINKS.map((l) => [0, 1, 2].map((k) => (
        <div key={`c${l.i}-${k}`} style={{ position: "absolute", left: l.x, top: l.y, zIndex: 4,
          "--dx": `${l.dx}px`, "--dy": `${l.dy}px`,
          animation: `flowComet ${1.7 + (l.i % 3) * 0.3}s linear ${l.i * 0.14 + k * 0.55}s infinite` }}>
          <span style={{ display: "block", width: k === 1 ? 7 : 5, height: k === 1 ? 7 : 5, marginLeft: -3, marginTop: -3,
            borderRadius: "50%", background: "radial-gradient(circle, #fff, #ffe6d2)",
            boxShadow: "0 0 10px 2px rgba(255,240,225,0.9)" }}/>
        </div>
      )))}
    </>
  );
});

/* ---- decision cards + threads, CSS-timed via animation-delay ---- */
function Blooms() {
  return (
    <>
      {BLOOMS.map((b, i) => {
        const dx = CX - b.ax, dy = CY - b.ay;
        const len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
        const delay = `${b.at / 1000}s`;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: b.ax, top: b.ay, width: len, height: 1, zIndex: 6,
              transformOrigin: "0 50%", transform: `rotate(${ang}deg)`, background: "rgba(255,255,255,0.5)",
              animation: "threadPulse 2.8s both", animationDelay: delay }}/>
            <div className="scene-card" style={{ left: b.x, top: b.y, width: 210, "--drift": b.drift, zIndex: 9, animationDelay: delay }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SrcIcon id={b.src} size={16}/>
                <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: "-0.01em", lineHeight: 1.15 }}>{b.t}</span>
              </div>
              <div style={{ fontFamily: "var(--font-grotesk)", fontSize: 12.5, fontWeight: 600, color: "var(--accent-ink)" }}>{b.s}</div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}

/* ---- central glass brain orb ---- */
function BrainCore({ done }) {
  return (
    <div style={{ position: "absolute", left: CX, top: CY, transform: "translate(-50%,-50%)", zIndex: 7 }}>
      {/* soft outer halo */}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.42) 0%, rgba(255,225,200,0.12) 45%, transparent 70%)",
        animation: "haloPulse 3.4s var(--ease-in-out) infinite" }}/>
      {/* expanding pulse rings */}
      {[0, 1, 2].map(i => (
        <span key={i} style={{ position: "absolute", left: "50%", top: "50%", width: 150, height: 150, marginLeft: -75, marginTop: -75,
          borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.45)", animation: `ringExpand 3s ${i * 1}s linear infinite` }}/>
      ))}
      {/* glass sphere */}
      <div style={{ position: "relative", width: 140, height: 140, borderRadius: "50%", display: "grid", placeItems: "center",
        background: "radial-gradient(circle at 36% 30%, #FFFFFF 0%, #FFF0E7 52%, #FFD9C6 100%)",
        boxShadow: "0 0 0 1.5px rgba(255,255,255,0.7), 0 0 0 14px rgba(255,255,255,0.10), 0 26px 80px rgba(120,28,2,0.55), inset 0 -10px 24px rgba(232,72,27,0.30), inset 0 8px 18px rgba(255,255,255,0.9)",
        animation: "corePulse 2.6s var(--ease-in-out) infinite" }}>
        {/* glossy highlight */}
        <span style={{ position: "absolute", top: 16, left: 30, width: 46, height: 28, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%)", filter: "blur(2px)" }}/>
        <I.hephH style={{ width: 52, height: 52, color: "var(--accent)", position: "relative" }}/>
        {done && <span style={{ position: "absolute", inset: -6, borderRadius: "50%", boxShadow: "0 0 90px 22px rgba(255,255,255,0.7)" }}/>}
      </div>
    </div>
  );
}

function LedgerStat({ label, target, run }) {
  const n = useCountUp(target, run, 2400);
  return (
    <div style={{ textAlign: "center", minWidth: 92 }}>
      <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 48, letterSpacing: "-0.035em", lineHeight: 1,
        color: "#fff", fontVariantNumeric: "tabular-nums", textShadow: "0 2px 24px rgba(120,28,2,0.45)" }}>
        {n.toLocaleString()}
      </div>
      <div className="mono" style={{ color: "rgba(255,255,255,0.72)", marginTop: 9 }}>{label}</div>
    </div>
  );
}

/* ---- drifting ambient light orbs for depth ---- */
const AMB = [
  { x: "18%", y: "26%", s: 360, c: "rgba(255,186,130,0.9)", d: 14 },
  { x: "76%", y: "30%", s: 300, c: "rgba(255,120,60,0.8)",  d: 18 },
  { x: "30%", y: "74%", s: 320, c: "rgba(255,150,90,0.7)",  d: 16 },
  { x: "70%", y: "72%", s: 280, c: "rgba(255,200,150,0.7)", d: 20 },
];

/* Static visual field — memoized so it mounts ONCE and its CSS/SMIL
   animations (orbit spin, comets, line draw, node float) run without
   being interrupted by the parent's timed re-renders. */
const BrainField = React.memo(function BrainField() {
  return (
    <>
      {/* ambient light orbs */}
      {AMB.map((o, i) => (
        <div key={i} className="amb-orb" style={{ left: o.x, top: o.y, width: o.s, height: o.s, background: `radial-gradient(circle, ${o.c}, transparent 68%)`,
          animation: `orbDrift ${o.d}s ease-in-out ${i * 1.3}s infinite` }}/>
      ))}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 1440, height: 824, transform: "translate(-50%,-50%)" }}>
        {/* orbit guide rings */}
        <div className="orbit-ring" style={{ width: RING * 2, height: RING * 2, animation: "orbitSpin 60s linear infinite" }}/>
        <div className="orbit-ring" style={{ width: RING * 2 - 120, height: RING * 2 - 120, borderColor: "rgba(255,255,255,0.10)", animation: "orbitSpinR 46s linear infinite" }}/>
        <div className="orbit-ring" style={{ width: RING * 2 + 140, height: RING * 2 + 140, borderColor: "rgba(255,255,255,0.07)", animation: "orbitSpin 80s linear infinite" }}/>

        <Connections/>

        {/* source nodes on the ring */}
        {EMITTERS.map((e, idx) => (
          <div key={idx} style={{ position: "absolute", left: e.x, top: e.y, zIndex: 8 }}>
            <div style={{ position: "absolute", left: "50%", top: "50%", animation: `nodeFloat ${4 + idx * 0.4}s ease-in-out ${idx * 0.3}s infinite` }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, transform: "translate(-50%,-50%)",
                background: "rgba(255,255,255,0.97)", display: "grid", placeItems: "center",
                boxShadow: "0 12px 34px rgba(120,30,4,0.45), 0 0 0 1px rgba(255,255,255,0.5), inset 0 1px 2px rgba(255,255,255,0.9)" }}>
                <SrcIcon id={e.id} size={30}/>
              </div>
              <div className="mono" style={{ position: "absolute", left: "50%", top: 34, transform: "translateX(-50%)", whiteSpace: "nowrap",
                color: "rgba(255,255,255,0.78)", fontSize: 9.5, marginTop: 4 }}>{SOURCES[e.id].name}</div>
            </div>
          </div>
        ))}

        <Blooms/>
      </div>
    </>
  );
});

function BuildBrain({ onComplete, calm }) {
  // discrete timed state — minimal re-renders; CSS owns continuous motion
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [runSrc, setRunSrc] = useState(false);
  const [runDec, setRunDec] = useState(false);
  const [runPol, setRunPol] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const T = [];
    PHASES.forEach((p, i) => { if (i > 0) T.push(setTimeout(() => setPhaseIdx(i), p.at)); });
    T.push(setTimeout(() => setRunSrc(true), 200));
    T.push(setTimeout(() => setRunDec(true), 1700));
    T.push(setTimeout(() => setRunPol(true), 3200));
    T.push(setTimeout(() => setDone(true), 6400));
    return () => T.forEach(clearTimeout);
  }, []);

  const phase = PHASES[phaseIdx];

  return (
    <div className={cx("brainstage", calm && "calm")}>
      {/* grain + vignette */}
      <div className="dotgrid" style={{ position: "absolute", inset: 0, opacity: 0.05, zIndex: 1 }}/>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(125% 85% at 50% 48%, transparent 52%, rgba(80,18,2,0.5))", zIndex: 1 }}/>

      {/* static animated field — mounts once, animations uninterrupted */}
      <BrainField/>

      {/* dynamic overlays (re-render with timed state) */}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 1440, height: 824, transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
        <BrainCore done={done}/>
      </div>

      {/* completion bloom flash */}
      {done && <div style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: "none",
        background: "radial-gradient(circle at 50% 49%, rgba(255,255,255,0.9), transparent 42%)", animation: "bloomFlash 1.1s var(--ease) forwards" }}/>}

      {/* top heading */}
      <div style={{ position: "absolute", top: 64, left: 0, right: 0, textAlign: "center", zIndex: 12 }}>
        <Mono style={{ color: "rgba(255,255,255,0.82)", letterSpacing: "0.28em" }}>{done ? "BRAIN ONLINE" : phase.mono}</Mono>
        <h1 className="display" style={{ color: "#fff", fontSize: 52, marginTop: 16, textShadow: "0 2px 30px rgba(120,28,2,0.4)" }}>
          {done ? <>Your brain is <span className="serif-italic" style={{ fontWeight: 400 }}>ready</span>.</> : "Building your brain"}
        </h1>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, marginTop: 11, height: 24 }}>
          {done ? "184 decisions · 52 policies · 37 skills extracted" : phase.line}
        </div>
      </div>

      {/* ledger */}
      <div style={{ position: "absolute", bottom: 96, left: 0, right: 0, zIndex: 12, display: "flex", justifyContent: "center", gap: 80 }}>
        <LedgerStat label="Sources read" target={2847} run={runSrc}/>
        <LedgerStat label="Decisions"    target={184}  run={runDec}/>
        <LedgerStat label="Policies"     target={52}   run={runPol}/>
        <LedgerStat label="Skills"       target={37}   run={runPol}/>
      </div>

      {/* footer control */}
      <div style={{ position: "absolute", bottom: 34, left: 44, right: 44, zIndex: 13, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#fff", borderRadius: 99, boxShadow: "0 0 12px rgba(255,255,255,0.7)",
            width: done ? "100%" : 0, animation: done ? "none" : "progFill 6.4s linear forwards" }}/>
        </div>
        {done
          ? <button className="btn" style={{ background: "#fff", color: "var(--accent-ink)", fontWeight: 700 }} onClick={onComplete}>Ask your brain <I.arrow className="arrow"/></button>
          : <button className="btn btn-ghost" style={{ color: "rgba(255,255,255,0.85)" }} onClick={onComplete}>Skip</button>}
      </div>
    </div>
  );
}

window.BuildBrain = BuildBrain;
