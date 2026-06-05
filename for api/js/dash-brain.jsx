/* ============================================================
   HEPHAESTOU V2 — DASHBOARD SHELL + OVERVIEW
   Collapsible sidebar · mission-control home
   ============================================================ */

const NAV_MAIN = [
  { id: "brain", label: "Overview", icon: I.brain },
  { id: "decisions", label: "Decisions", icon: I.decision },
  { id: "reviews", label: "Reviews", icon: I.review },
];
const NAV_KNOW = [
  { id: "sources", label: "Sources", icon: I.sources },
  { id: "skills", label: "Skills", icon: I.skills },
];

/* ---------------- Sidebar ---------------- */
function NavItem({ n, on, badge, collapsed, onClick }) {
  return (
    <button onClick={onClick} className="navitem" data-on={on} data-collapsed={collapsed} title={collapsed ? n.label : undefined}>
      <n.icon className="ni-ico"/>
      {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{n.label}</span>}
      {!collapsed && badge ? <span className="ni-badge">{badge}</span> : null}
      {collapsed && badge ? <span className="ni-dot"/> : null}
    </button>
  );
}

function Sidebar({ page, setPage, reviewCount, onLogout, onOpenCmd, collapsed }) {
  const [menu, setMenu] = useState(false);
  const pad = collapsed ? "14px 12px 16px" : "14px 14px 16px";
  return (
    <div style={{ width: collapsed ? 72 : 252, flex: "none", background: "var(--cream)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", padding: pad,
      transition: "width .26s var(--ease)", overflow: "hidden" }}>

      {/* workspace switcher */}
      <div style={{ position: "relative" }}>
        <button onClick={() => collapsed ? setPage("brain") : setMenu(m => !m)} title={collapsed ? "Riverline" : undefined}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: collapsed ? "6px" : "8px", borderRadius: 11, justifyContent: collapsed ? "center" : "flex-start", transition: "background .14s" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--paper)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--ink)", color: "var(--ivory)", display: "grid", placeItems: "center", flex: "none" }}>
            <I.hephH style={{ width: 18 }}/>
          </span>
          {!collapsed && <>
            <div style={{ minWidth: 0, textAlign: "left", flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.02em", lineHeight: 1.15 }}>Riverline</div>
              <div style={{ fontSize: 11, color: "var(--ink-4)", lineHeight: 1.2 }}>Pro workspace</div>
            </div>
            <I.chevD style={{ width: 15, color: "var(--ink-4)", flex: "none", transform: menu ? "rotate(180deg)" : "none", transition: "transform .2s" }}/>
          </>}
        </button>
        {menu && !collapsed && (
          <>
            <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 39 }}/>
            <div className="card" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, padding: 6, boxShadow: "var(--sh-3)", zIndex: 40, animation: "fadeUp .16s var(--ease) both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px 10px" }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: "var(--ink)", color: "var(--ivory)", display: "grid", placeItems: "center", flex: "none", fontWeight: 700, fontSize: 13 }}>R</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>Riverline</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>riverline.io · 12 members</div>
                </div>
              </div>
              <div style={{ height: 1, background: "var(--line)", margin: "2px 0 4px" }}/>
              {[["Workspace settings", I.settings, () => { setPage("settings"); setMenu(false); }],
                ["Invite team", I.plus, () => setMenu(false)]].map(([l, Ico, fn]) => (
                <button key={l} onClick={fn} className="menurow"><Ico style={{ width: 16, color: "var(--ink-4)" }}/> {l}</button>
              ))}
              <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }}/>
              <button onClick={onLogout} className="menurow" style={{ color: "var(--accent-ink)", fontWeight: 600 }}><I.logout style={{ width: 16 }}/> Log out</button>
            </div>
          </>
        )}
      </div>

      {/* search / command trigger */}
      <button onClick={onOpenCmd} title={collapsed ? "Search or ask (⌘K)" : undefined}
        style={{ display: "flex", alignItems: "center", gap: 9, height: collapsed ? 44 : 38, width: collapsed ? 44 : "auto", margin: collapsed ? "12px auto 0" : "12px 0 0", padding: collapsed ? 0 : "0 11px", justifyContent: "center", borderRadius: collapsed ? 12 : 10,
        border: "1px solid var(--line-2)", background: "var(--paper)", color: "var(--ink-4)", transition: "border-color .14s, background .14s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ink-4)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line-2)"; }}>
        <I.search style={{ width: 16, flex: "none" }}/>
        {!collapsed && <><span style={{ flex: 1, textAlign: "left", fontSize: 13.5, color: "var(--ink-3)" }}>Search or ask…</span><Kbd>⌘K</Kbd></>}
      </button>

      {/* nav */}
      <div style={{ marginTop: 8, flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
        {!collapsed && <div className="sec-label">Workspace</div>}
        {collapsed && <div style={{ height: 14 }}/>}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_MAIN.map(n => <NavItem key={n.id} n={n} on={page === n.id} badge={n.id === "reviews" ? reviewCount : 0} collapsed={collapsed} onClick={() => setPage(n.id)}/>)}
        </div>
        {!collapsed ? <div className="sec-label">Knowledge</div> : <div style={{ height: 10, margin: "10px 0", borderTop: "1px solid var(--line)" }}/>}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_KNOW.map(n => <NavItem key={n.id} n={n} on={page === n.id} collapsed={collapsed} onClick={() => setPage(n.id)}/>)}
        </div>
      </div>

      {/* usage */}
      {!collapsed && (
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--line)", marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span className="sec-label" style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>Brain usage</span>
            <span className="tnum" style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>68%</span>
          </div>
          <div className="meter"><i style={{ width: "68%", background: "var(--accent)" }}/></div>
          <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 8 }}>18.4k of 27k queries this month</div>
        </div>
      )}

      {/* account */}
      <button onClick={() => setPage("settings")} title={collapsed ? "Dana Reyes" : undefined}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "8px 0" : "8px", marginTop: collapsed ? 8 : 0, borderTop: collapsed ? "1px solid var(--line)" : "none",
        justifyContent: collapsed ? "center" : "flex-start", borderRadius: collapsed ? 0 : 11, transition: "background .14s" }}
        onMouseEnter={e => { if (!collapsed) e.currentTarget.style.background = "var(--paper)"; }} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <Avatar name="Dana Reyes" color="#C2603A" size={32}/>
        {!collapsed && <>
          <div style={{ minWidth: 0, textAlign: "left", flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.01em", lineHeight: 1.15 }}>Dana Reyes</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-4)", lineHeight: 1.2 }}>Head of CX · Admin</div>
          </div>
          <I.settings style={{ width: 16, color: "var(--ink-4)", flex: "none" }}/>
        </>}
      </button>
    </div>
  );
}

/* ---------------- Page header ---------------- */
function PageHead({ label, title, sub, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", padding: "28px 40px 22px", borderBottom: "1px solid var(--line-soft)" }}>
      <div>
        {label && <div className="sec-label" style={{ padding: 0, margin: "0 0 9px" }}>{label}</div>}
        <h1 style={{ fontSize: 29, letterSpacing: "-0.025em" }}>{title}</h1>
        {sub && <p style={{ fontSize: 14.5, color: "var(--ink-3)", marginTop: 7 }}>{sub}</p>}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>{right}</div>
    </div>
  );
}

/* ================= OVERVIEW (home) ================= */
function BrainPage({ setPage, onAskBrain }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const kpis = [
    { n: 184, label: "Decisions", icon: I.decision, spark: [120,138,150,162,170,178,184], trend: 8 },
    { n: 52, label: "Policies", icon: I.doc, spark: [30,36,40,44,46,49,52], trend: 6 },
    { n: 37, label: "Skills live", icon: I.skills, spark: [12,18,22,26,30,34,37], trend: 12 },
    { n: 3, label: "Awaiting review", icon: I.review, accent: true, spark: [6,5,7,4,5,4,3], trend: -25 },
  ];

  return (
    <div className="scroll-y" style={{ flex: 1 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "30px 40px 60px" }}>

        {/* greeting */}
        <div className="fade-up" style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 30, letterSpacing: "-0.03em" }}>{greet}, <span className="serif-italic" style={{ fontWeight: 400 }}>Dana</span></h1>
            <p style={{ fontSize: 15, color: "var(--ink-3)", marginTop: 6 }}>Here's what Riverline's brain learned while you were away.</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-3)" }}>
            <span className="statusdot live"/> All sources synced · 4m ago
          </div>
        </div>

        {/* hero ask — opens the brain chat */}
        <div className="card sheen fade-up d1" style={{ marginTop: 22, padding: 22, borderRadius: 16, position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, var(--paper-2), var(--paper))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, flex: "none", display: "grid", placeItems: "center",
              background: "var(--accent)", color: "#fff", boxShadow: "0 6px 18px var(--accent-glow)" }}><I.brain style={{ width: 24 }}/></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>Ask your company brain</div>
              <div style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 2 }}>184 decisions, 52 policies and 37 skills — one question away.</div>
            </div>
            <button className="btn btn-solid" onClick={() => onAskBrain && onAskBrain()} style={{ flex: "none" }}><I.spark style={{ width: 16 }}/> Open brain</button>
          </div>
          {/* suggestions — clean text links, not pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 22px", marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 13, color: "var(--ink-4)", fontWeight: 600 }}>Try asking</span>
            {RECENT_Q.map(ex => (
              <button key={ex} onClick={() => onAskBrain && onAskBrain(ex)} className="ask-link">
                {ex}<I.arrow style={{ width: 13 }}/>
              </button>
            ))}
          </div>
        </div>

        {/* KPI row */}
        <div className="fade-up d2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 22 }}>
          {kpis.map((c, i) => <CoverTile key={i} {...c}/>)}
        </div>

        {/* main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 22, marginTop: 22 }} className="fade-up d3">
          {/* left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
            <Panel title="Needs your review" badge={REVIEWS.length} action="Review all" onAction={() => setPage("reviews")} accent>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {REVIEWS.map((r, i) => (
                  <button key={r.id} onClick={() => setPage("reviews")} className="row-h" style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 18px", textAlign: "left",
                    borderTop: i ? "1px solid var(--line-soft)" : "none" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--cream)", display: "grid", placeItems: "center", flex: "none" }}><SrcIcon id={r.src} size={18}/></span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>{r.kind} · {SOURCES[r.src].name}</div>
                    </div>
                    <span className="chip" style={{ flex: "none" }}>{r.kind === "New skill" ? "Skill" : "Policy"}</span>
                    <I.chevR style={{ width: 16, color: "var(--ink-4)", flex: "none" }}/>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Recently extracted" action="View all" onAction={() => setPage("decisions")}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {DECISIONS.slice(0, 4).map((d, i) => (
                  <button key={d.id} onClick={() => setPage("decisions")} className="row-h" style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 18px", textAlign: "left",
                    borderTop: i ? "1px solid var(--line-soft)" : "none" }}>
                    <SrcIcon id={d.src} size={18}/>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.body}</div>
                    </div>
                    <span style={{ flex: "none" }}><StatusTag status={d.status}/></span>
                    <span className="tnum" style={{ fontSize: 11.5, color: "var(--ink-4)", flex: "none", width: 34, textAlign: "right" }}>{d.updated}</span>
                  </button>
                ))}
              </div>
            </Panel>
          </div>

          {/* right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <Panel title="Source health" action="Manage" onAction={() => setPage("sources")}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {Object.keys(SOURCES).map((id, i) => {
                  const h = SOURCE_HEALTH[id];
                  return (
                    <div key={id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 18px", borderTop: i ? "1px solid var(--line-soft)" : "none" }}>
                      <SrcIcon id={id} size={18}/>
                      <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1, letterSpacing: "-0.01em" }}>{SOURCES[id].name}</span>
                      {h.pending > 0
                        ? <span className="chip amber" style={{ height: 21 }}>{h.pending} pending</span>
                        : <span className="tnum" style={{ fontSize: 11.5, color: "var(--ink-4)" }}>{h.sync}</span>}
                      <span className="statusdot live" style={{ flex: "none" }}/>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Activity">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {ACTIVITY.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 18px", borderTop: i ? "1px solid var(--line-soft)" : "none" }}>
                    <span style={{ marginTop: 1 }}><SrcIcon id={a.src} size={17}/></span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>{a.txt}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.det}</div>
                    </div>
                    <span className="tnum" style={{ fontSize: 11, color: "var(--ink-4)", flex: "none" }}>{a.t}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

/* reusable panel with header */
function Panel({ title, badge, action, onAction, accent, children }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "13px 18px", borderBottom: "1px solid var(--line)" }}>
        <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: "-0.01em" }}>{title}</span>
        {badge ? <span className="tnum" style={{ fontSize: 11, fontWeight: 700, color: accent ? "#fff" : "var(--ink-2)", background: accent ? "var(--accent)" : "var(--cream)", borderRadius: 99, padding: "1px 8px" }}>{badge}</span> : null}
        {action && <button onClick={onAction} className="panel-action" style={{ marginLeft: "auto" }}>{action} <I.arrow style={{ width: 13 }}/></button>}
      </div>
      {children}
    </div>
  );
}

function CoverTile({ n, label, icon: Ico, accent, spark, trend }) {
  const v = useCountUp(n, true, 1100);
  return (
    <div className="card sheen" style={{ padding: 17 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flex: "none",
          background: accent ? "var(--accent-soft)" : "var(--cream)", color: accent ? "var(--accent-ink)" : "var(--ink-3)" }}>
          <Ico style={{ width: 17, height: 17 }}/>
        </span>
        <div style={{ marginLeft: "auto" }}>
          <Sparkline data={spark} w={76} h={24} color={accent ? "var(--accent)" : "var(--ink-3)"}/>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginTop: 13 }}>
        <span style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 33, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: accent ? "var(--accent)" : "var(--ink)" }}>{v}</span>
        {trend !== 0 && <Trend v={trend}/>}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 6 }}>{label}</div>
    </div>
  );
}

window.BrainPage = BrainPage;
window.Sidebar = Sidebar;
window.PageHead = PageHead;
window.Panel = Panel;
