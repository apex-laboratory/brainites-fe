/* ============================================================
   HEPHAESTOU V2 — SHARED LIB
   Brand icons, UI icons, primitives, window chrome
   ============================================================ */
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const cx = (...a) => a.filter(Boolean).join(" ");

/* ---------- Brand / source marks ---------- */
const Brand = {
  slack: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path fill="#36C5F0" d="M6 15.2A2.1 2.1 0 1 1 3.9 13.1H6zM7.1 15.2a2.1 2.1 0 1 1 4.2 0v5.3a2.1 2.1 0 1 1-4.2 0z"/>
      <path fill="#2EB67D" d="M8.8 6A2.1 2.1 0 1 1 10.9 3.9V6zM8.8 7.1a2.1 2.1 0 1 1 0 4.2H3.5a2.1 2.1 0 1 1 0-4.2z"/>
      <path fill="#ECB22E" d="M18 8.8A2.1 2.1 0 1 1 20.1 10.9H18zM16.9 8.8a2.1 2.1 0 1 1-4.2 0V3.5a2.1 2.1 0 1 1 4.2 0z"/>
      <path fill="#E01E5A" d="M15.2 18a2.1 2.1 0 1 1-2.1 2.1V18zM15.2 16.9a2.1 2.1 0 1 1 0-4.2h5.3a2.1 2.1 0 1 1 0 4.2z"/>
    </svg>
  ),
  notion: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#fff" stroke="#E6E1D6"/>
      <path fill="#191919" d="M7.3 7.1l7.2-.5c.5 0 .7.1 1 .4l2 1.4c.2.2.3.3.3.6v8.3c0 .5-.2.8-.8.8l-8.3.5c-.4 0-.6-.1-.8-.4l-1.5-2c-.2-.3-.3-.5-.3-.8V7.9c0-.4.2-.7.7-.8z"/>
      <path fill="#fff" d="M9.2 9.3v6.3l1 .1V11l3.6 5 1 .1V9.9l-1-.1v4.3l-3.5-4.7z"/>
    </svg>
  ),
  github: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path fill="#1B1A15" fillRule="evenodd" clipRule="evenodd" d="M12 2.2A9.8 9.8 0 0 0 8.9 21.3c.5.1.7-.2.7-.5v-1.7c-2.7.6-3.3-1.3-3.3-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.3.3.7 1 .7 2v2.9c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2z"/>
    </svg>
  ),
  jira: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path fill="#2684FF" d="M11.5 2.3 3.4 10.4a.8.8 0 0 0 0 1.1l8.1 8.1.6.6.6-.6 1.9-1.9-3.6-3.6-2.6-2.6 6.2-6.2-.6-.6z"/>
      <path fill="#2684FF" opacity=".7" d="M12.1 7.9 8.5 11.5l3.6 3.6 3.6-3.6z"/>
      <path fill="#2684FF" d="M12.7 1.7 20.8 9.8a.8.8 0 0 1 0 1.1l-8.1 8.1-.6-.6 6.2-6.2-6.2-6.2 0 0-.6-.6 1.2-1.7z" opacity=".55"/>
    </svg>
  ),
  zendesk: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path fill="#17494D" d="M11.2 7.4v12.4L3 19.8z"/>
      <path fill="#17494D" d="M11.2 4.2a4.1 4.1 0 0 1-8.2 0z"/>
      <path fill="#17494D" d="M12.8 16.6a4.1 4.1 0 0 1 8.2 0z"/>
      <path fill="#17494D" d="M12.8 13.4V1L21 1z"/>
    </svg>
  ),
  google: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path fill="#4285F4" d="M21.6 12.2c0-.6-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2z"/>
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/>
      <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9z"/>
      <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z"/>
    </svg>
  ),
};

const SOURCES = {
  slack:   { name: "Slack",   icon: Brand.slack,   c: "#4A154B" },
  notion:  { name: "Notion",  icon: Brand.notion,  c: "#191919" },
  github:  { name: "GitHub",  icon: Brand.github,  c: "#1B1A15" },
  jira:    { name: "Jira",    icon: Brand.jira,    c: "#2684FF" },
  zendesk: { name: "Zendesk", icon: Brand.zendesk, c: "#17494D" },
};

/* ---------- UI icons (Phosphor / Heroicon-ish, 24 grid, currentColor) ---------- */
const I = {
  arrow:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  arrowL:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>,
  search:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/></svg>,
  brain:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5.5a3 3 0 0 0-5.7-1.3A2.8 2.8 0 0 0 4 9a2.7 2.7 0 0 0 .3 4.6A2.8 2.8 0 0 0 7 18a3 3 0 0 0 5 1.6 3 3 0 0 0 5-1.6 2.8 2.8 0 0 0 2.7-4.4A2.7 2.7 0 0 0 20 9a2.8 2.8 0 0 0-2.3-4.8A3 3 0 0 0 12 5.5z"/><path d="M12 5.5v14M8.5 9.5h0M15.5 9.5h0M7 13.5h0M17 13.5h0"/></svg>,
  decision:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  review:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/><path d="M12 7v5l3 2"/></svg>,
  sources: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7.5 8 11 15.5M16.5 8 13 15.5M8.5 6h7"/></svg>,
  skills:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 5h14v14H5z"/><path d="M9 9h6M9 13h6M9 17h3"/></svg>,
  settings:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 15H2.5a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1A2 2 0 1 1 6.4 5.4l.1.1A1.6 1.6 0 0 0 9 4.6V4.5a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.1.9z"/></svg>,
  spark:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2.6c.6 3.9 2.9 6.2 6.8 6.8-3.9.6-6.2 2.9-6.8 6.8-.6-3.9-2.9-6.2-6.8-6.8 3.9-.6 6.2-2.9 6.8-6.8zM18.5 14c.3 1.9 1.4 3 3.3 3.3-1.9.3-3 1.4-3.3 3.3-.3-1.9-1.4-3-3.3-3.3 1.9-.3 3-1.4 3.3-3.3z"/></svg>,
  check:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12.5 9 17.5 20 6.5"/></svg>,
  x:       (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>,
  plus:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  bolt:    (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>,
  clock:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  dot:     (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="12" cy="12" r="4"/></svg>,
  diff:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v18M5 8H2m3 8H2m20-8h-3m3 8h-3"/></svg>,
  chevR:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 5l7 7-7 7"/></svg>,
  chevD:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 9l7 7 7-7"/></svg>,
  link:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 13a4 4 0 0 0 5.6 0l3-3a4 4 0 1 0-5.6-5.6l-1.5 1.5M14 11a4 4 0 0 0-5.6 0l-3 3a4 4 0 1 0 5.6 5.6l1.5-1.5"/></svg>,
  doc:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>,
  pin:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 4h6l-1 6 3 3v2H7v-2l3-3z M12 18v3"/></svg>,
  logout:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  bell:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>,
  help:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M9.2 9a2.8 2.8 0 0 1 5.4 1c0 1.8-2.6 2.4-2.6 2.4M12 17h0"/></svg>,
  filter:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5h18l-7 8v6l-4-2v-4z"/></svg>,
  grid:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  ext:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 3h6v6M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/></svg>,
  sidebar: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>,
  hephH:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" {...p}><path d="M6 4v16M18 4v16M6 12h12"/></svg>,
};

/* ---------- Logo ---------- */
function Logo({ size = "md", onDark }) {
  return (
    <div className="logo" style={size === "lg" ? { gap: 11 } : {}}>
      <span className="mark" style={size === "lg" ? { width: 32, height: 32, borderRadius: 9 } : {}}>
        <I.hephH style={size === "lg" ? { width: 19, height: 19 } : {}}/>
      </span>
      <span className="word" style={size === "lg" ? { fontSize: 22 } : {}}>hephaestou<b>.</b></span>
    </div>
  );
}

/* ---------- Mono label ---------- */
function Mono({ children, bracket, style, className }) {
  return <div className={cx("mono", bracket && "mono-bracket", className)} style={style}>{children}</div>;
}

/* ---------- Button ---------- */
function Btn({ variant = "solid", size, arrow, icon, children, className, ...rest }) {
  return (
    <button className={cx("btn", `btn-${variant}`, size && `btn-${size}`, className)} {...rest}>
      {icon}{children}
      {arrow && <I.arrow className="arrow"/>}
    </button>
  );
}

/* ---------- App window chrome ---------- */
function AppWindow({ title, accent, children, style, barRight, className }) {
  return (
    <div className={cx("appwin", className)} style={style}>
      <div className="appwin-bar">
        <div className="traffic"><i className="r"/><i className="y"/><i className="g"/></div>
        {title && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>{accent}{title}</div>}
        <div style={{ marginLeft: "auto" }}>{barRight}</div>
      </div>
      {children}
    </div>
  );
}

/* ---------- Source glyph ---------- */
function SrcIcon({ id, size = 22 }) {
  const s = SOURCES[id]; if (!s) return null;
  const Ico = s.icon;
  return <span className="srcicon" style={{ width: size, height: size }}><Ico/></span>;
}

/* ---------- Avatar ---------- */
function Avatar({ name, color, size = 34 }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("");
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center",
      background: color || "var(--cream)", color: "#fff", fontWeight: 700, fontSize: size * 0.38, letterSpacing: "-0.02em" }}>
      {initials}
    </div>
  );
}

/* ---------- Counter (animated number, rAF with guaranteed settle) ---------- */
function useCountUp(target, run, dur = 900) {
  const [n, setN] = useState(run ? 0 : target);
  useEffect(() => {
    if (!run) { setN(target); return; }
    let raf, t0, settled = false;
    const step = (t) => { t0 = t0 || t; const p = Math.min(1, (t - t0) / dur);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(step); else settled = true; };
    raf = requestAnimationFrame(step);
    // fallback: if rAF is throttled (background tab), snap to final value
    const fb = setTimeout(() => { if (!settled) setN(target); }, dur + 300);
    return () => { cancelAnimationFrame(raf); clearTimeout(fb); };
  }, [target, run]);
  return n;
}

/* ---------- Sparkline (smooth area + line) ---------- */
function Sparkline({ data, w = 96, h = 30, color = "var(--accent)", fill = true, strokeW = 1.6 }) {
  const max = Math.max(...data), min = Math.min(...data), span = max - min || 1;
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * w, h - ((v - min) / span) * (h - 4) - 2 ]);
  // smooth path via simple Catmull-Rom → bezier
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  const id = useMemo(() => "sl" + Math.random().toString(36).slice(2, 8), []);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
      {fill && <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.22"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>}
      {fill && <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} stroke="none"/>}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.4" fill={color}/>
    </svg>
  );
}

/* ---------- Trend delta chip ---------- */
function Trend({ v, suffix = "%" }) {
  const up = v >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "var(--font-grotesk)", fontSize: 11.5, fontWeight: 700, fontVariantNumeric: "tabular-nums",
      color: up ? "var(--green)" : "#C0483A" }}>
      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: up ? "none" : "scaleY(-1)" }}><path d="M5 14l7-7 7 7"/></svg>
      {Math.abs(v)}{suffix}
    </span>
  );
}

/* ---------- Keyboard chip ---------- */
function Kbd({ children }) { return <span className="kbd">{children}</span>; }

/* ---------- Segmented control ---------- */
function Segmented({ value, options, onChange }) {
  return (
    <div className="seg">
      {options.map(o => {
        const val = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        return <button key={val} data-on={value === val} onClick={() => onChange(val)}>{label}</button>;
      })}
    </div>
  );
}

Object.assign(window, { cx, Brand, SOURCES, I, Logo, Mono, Btn, AppWindow, SrcIcon, Avatar, useCountUp,
  Sparkline, Trend, Kbd, Segmented,
  useState, useEffect, useRef, useMemo, useCallback });
