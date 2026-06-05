/* ============================================================
   HEPHAESTOU V2 — DASHBOARD CHROME
   Global top bar + ⌘K command palette
   ============================================================ */

const PAGE_META = {
  brain:     { title: "Overview" },
  decisions: { title: "Decisions" },
  reviews:   { title: "Reviews" },
  sources:   { title: "Sources" },
  skills:    { title: "Skills" },
  settings:  { title: "Settings" },
};

function TopBar({ page, setPage, onOpenCmd, reviewCount, collapsed, onToggleSidebar }) {
  const meta = PAGE_META[page] || {};
  return (
    <div className="topbar">
      <button className="iconbtn" onClick={onToggleSidebar} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} style={{ marginLeft: -6, marginRight: 2 }}>
        <I.sidebar style={{ transform: collapsed ? "scaleX(-1)" : "none" }}/>
      </button>
      <div className="crumb">
        <span>Riverline</span>
        <I.chevR style={{ width: 13, color: "var(--ink-4)" }}/>
        <b>{meta.title}</b>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        <button className="btn btn-sm" onClick={onOpenCmd} style={{ height: 34, border: "1px solid var(--line-2)", background: "var(--paper)", color: "var(--ink-3)", fontWeight: 500, paddingLeft: 12, paddingRight: 10 }}>
          <I.search style={{ width: 15 }}/> Ask <Kbd>⌘K</Kbd>
        </button>
        <button className="iconbtn" style={{ position: "relative" }} onClick={() => setPage("reviews")} title="Notifications">
          <I.bell/>
          {reviewCount > 0 && <span style={{ position: "absolute", top: 5, right: 6, width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", border: "2px solid var(--ivory)" }}/>}
        </button>
        <button className="iconbtn" title="Help"><I.help/></button>
      </div>
    </div>
  );
}

/* ---- command palette ---- */
function CmdSection({ label }) {
  return <div className="sec-label" style={{ padding: "12px 14px 6px", margin: 0 }}>{label}</div>;
}
function CmdRow({ icon: Ico, label, hint, accent, active, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", height: 44, padding: "0 14px", borderRadius: 10, textAlign: "left",
      background: active ? "var(--cream)" : "transparent", transition: "background .12s" }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--cream)"} onMouseLeave={e => e.currentTarget.style.background = active ? "var(--cream)" : "transparent"}>
      <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flex: "none",
        background: accent ? "var(--accent)" : "var(--paper)", color: accent ? "#fff" : "var(--ink-3)", border: accent ? "none" : "1px solid var(--line)" }}>
        <Ico style={{ width: 16 }}/>
      </span>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: accent ? 600 : 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {hint && <Kbd>{hint}</Kbd>}
    </button>
  );
}
function CommandPalette({ open, onClose, setPage, onAskBrain }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (open) { setQ(""); const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 40); return () => clearTimeout(t); } }, [open]);
  if (!open) return null;

  const nav = [
    { id: "brain", label: "Overview", icon: I.brain }, { id: "decisions", label: "Decisions", icon: I.decision },
    { id: "reviews", label: "Reviews", icon: I.review }, { id: "sources", label: "Sources", icon: I.sources },
    { id: "skills", label: "Skills", icon: I.skills }, { id: "settings", label: "Settings", icon: I.settings },
  ];
  const ql = q.toLowerCase();
  const navF = nav.filter(n => n.label.toLowerCase().includes(ql));
  const recents = (window.RECENT_Q || []).filter(r => r.toLowerCase().includes(ql));
  const ask = (text) => { onClose(); if (onAskBrain) onAskBrain(text && typeof text === "string" ? text : (q.trim() || undefined)); };

  return (
    <div onClick={onClose} className="fade-in" style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(22,18,11,0.42)", backdropFilter: "blur(3px)", display: "grid", placeItems: "start center", paddingTop: 130 }}>
      <div onClick={e => e.stopPropagation()} className="card sheen" style={{ width: 580, maxWidth: "92%", padding: 0, overflow: "hidden", boxShadow: "var(--sh-3)", borderRadius: 16, animation: "scaleIn .18s var(--ease) both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 18px", borderBottom: "1px solid var(--line)" }}>
          <I.search style={{ width: 20, color: "var(--ink-4)", flex: "none" }}/>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && q.trim()) ask(); if (e.key === "Escape") onClose(); }}
            placeholder="Ask your brain or search…" style={{ border: "none", background: "transparent", outline: "none", fontSize: 16.5, flex: 1 }}/>
          <Kbd>esc</Kbd>
        </div>
        <div className="scroll-y" style={{ maxHeight: 360, padding: 8 }}>
          {q.trim() && <CmdRow icon={I.brain} accent active label={`Ask: "${q}"`} hint="↵" onClick={ask}/>}
          {navF.length > 0 && <CmdSection label="Go to"/>}
          {navF.map(n => <CmdRow key={n.id} icon={n.icon} label={n.label} onClick={() => { setPage(n.id); onClose(); }}/>)}
          {recents.length > 0 && <CmdSection label="Recent questions"/>}
          {recents.map((r, i) => <CmdRow key={i} icon={I.clock} label={r} onClick={() => ask(r)}/>)}
          {navF.length === 0 && recents.length === 0 && !q.trim() && <div style={{ padding: 24, textAlign: "center", color: "var(--ink-4)", fontSize: 14 }}>Type to search</div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TopBar, CommandPalette });
