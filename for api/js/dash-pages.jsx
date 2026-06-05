/* ============================================================
   HEPHAESTOU V2 — DASHBOARD PAGES
   Decisions · Reviews · Sources · Skills · Settings + shell
   ============================================================ */

/* ================= DECISIONS (master–detail) ================= */
function DecisionRow({ d, active, onClick }) {
  return (
    <button onClick={onClick} className="row-h" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 16px", textAlign: "left",
      background: active ? "var(--paper-2)" : "transparent", borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent" }}>
      <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--cream)", display: "grid", placeItems: "center", flex: "none" }}><SrcIcon id={d.src} size={17}/></span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{d.cat} · {d.updated}</div>
      </div>
      <span style={{ width: 6, height: 6, borderRadius: "50%", flex: "none",
        background: d.status === "approved" ? "var(--green)" : d.status === "review" ? "var(--amber)" : "var(--accent)" }}/>
    </button>
  );
}
function DecisionDetail({ d }) {
  return (
    <div className="scroll-y" style={{ flex: 1, padding: "28px 32px 50px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--cream)", display: "grid", placeItems: "center", flex: "none" }}><SrcIcon id={d.src} size={22}/></span>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono">{d.cat.toUpperCase()}</span><StatusTag status={d.status}/>
          </div>
          <h2 style={{ fontSize: 23, letterSpacing: "-0.02em", marginTop: 5 }}>{d.title}</h2>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm"><I.ext style={{ width: 14 }}/> Source</button>
          <button className="btn btn-solid btn-sm"><I.pin style={{ width: 14 }}/> Pin</button>
        </div>
      </div>

      <p style={{ fontSize: 15.5, lineHeight: 1.62, color: "var(--ink-2)", marginTop: 20, maxWidth: 640 }}>{d.body}</p>

      {/* executable rule */}
      <div style={{ marginTop: 22 }}>
        <Mono style={{ marginBottom: 8 }}>EXECUTABLE RULE</Mono>
        <div style={{ padding: "16px 18px", background: "var(--solid)", borderRadius: 12, fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.7, color: "var(--solid-ink)", overflowX: "auto" }}>
          <span style={{ color: "var(--accent)" }}>{d.rule.split(" ")[0]}</span>{d.rule.slice(d.rule.indexOf(" "))}
        </div>
      </div>

      {/* meta grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 22 }}>
        <Mini label="Confidence" value={`${d.conf}%`}/>
        <Mini label="Times applied" value={`${d.uses} / mo`}/>
        <Mini label="Source" value={`${SOURCES[d.src].name} · ${d.where}`}/>
      </div>

      {/* owner + provenance */}
      <div className="card" style={{ marginTop: 22, padding: 18 }}>
        <Mono style={{ marginBottom: 14 }}>PROVENANCE</Mono>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={d.owner} color={d.oc} size={36}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{d.owner}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Decision owner</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{d.conf}%</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>extraction confidence</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Extracted from</span>
          <span className="tag"><SrcIcon id={d.src} size={13}/> {d.where}</span>
          <span style={{ fontFamily: "var(--font-grotesk)", fontVariantNumeric: "tabular-nums", fontSize: 11.5, color: "var(--ink-4)", marginLeft: "auto" }}>updated {d.updated}</span>
        </div>
      </div>
    </div>
  );
}
function DecisionsPage() {
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState(DECISIONS[0].id);
  const tabs = [["all", "All"], ["approved", "Approved"], ["active", "Active"], ["review", "Review"]];
  const list = filter === "all" ? DECISIONS : DECISIONS.filter(d => d.status === filter);
  const current = DECISIONS.find(d => d.id === sel) || list[0];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHead label="COMPANY LOGIC · 184 DECISIONS" title="Decisions" sub="The calls your team has made, extracted and made executable."
        right={<Segmented value={filter} options={tabs.map(([value, label]) => ({ value, label }))} onChange={setFilter}/>}/>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* list */}
        <div className="scroll-y" style={{ width: 340, flex: "none", borderRight: "1px solid var(--line)", padding: "8px 0" }}>
          {list.map(d => <DecisionRow key={d.id} d={d} active={current && current.id === d.id} onClick={() => setSel(d.id)}/>)}
        </div>
        {/* detail */}
        {current && <DecisionDetail d={current}/>}
      </div>
    </div>
  );
}

/* ================= REVIEWS ================= */
function ReviewCard({ r, onResolve }) {
  const [gone, setGone] = useState(null);
  const act = (verdict) => { setGone(verdict); setTimeout(() => onResolve(r.id, verdict), 280); };
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", transition: "opacity .28s, transform .28s var(--ease)",
      opacity: gone ? 0 : 1, transform: gone ? `translateX(${gone === "approve" ? 40 : -40}px)` : "none" }}>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="tag accent">{r.kind}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--ink-3)" }}><SrcIcon id={r.src} size={14}/> {r.where}</span>
          <span style={{ marginLeft: "auto" }}><Conf v={r.conf}/></span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.015em" }}>{r.title}</div>
        {/* diff */}
        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <div style={{ flex: 1, padding: "11px 14px", borderRadius: 10, background: "color-mix(in srgb, #C0392B 8%, var(--paper))", border: "1px solid color-mix(in srgb, #C0392B 22%, transparent)" }}>
            <div className="mono" style={{ color: "#B0463A", fontSize: 9.5, marginBottom: 5 }}>− BEFORE</div>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", textDecoration: "line-through", textDecorationColor: "color-mix(in srgb,#C0392B 50%,transparent)" }}>{r.before}</div>
          </div>
          <div style={{ flex: 1, padding: "11px 14px", borderRadius: 10, background: "var(--green-soft)", border: "1px solid color-mix(in srgb, var(--green) 28%, transparent)" }}>
            <div className="mono" style={{ color: "var(--green)", fontSize: 9.5, marginBottom: 5 }}>+ AFTER</div>
            <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 600 }}>{r.after}</div>
          </div>
        </div>
        {/* evidence */}
        <div style={{ padding: "12px 16px", background: "var(--cream)", borderRadius: 10, borderLeft: "2px solid var(--accent)" }}>
          <div style={{ fontSize: 14, fontStyle: "italic", color: "var(--ink-2)", lineHeight: 1.55 }}>{r.quote}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 9 }}>{r.who}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 24px", borderTop: "1px solid var(--line)", background: "var(--paper)" }}>
        <span className="mono" style={{ color: "var(--ink-4)" }}>REVIEW IN UNDER 30s</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => act("reject")}><I.x style={{ width: 15 }}/> Reject</button>
          <button className="btn btn-sm" style={{ background: "var(--green)", color: "#fff" }} onClick={() => act("approve")}><I.check style={{ width: 15 }}/> Approve</button>
        </div>
      </div>
    </div>
  );
}
function ReviewsPage({ onResolve, queue }) {
  const total = REVIEWS.length;
  const done = total - queue.length;
  return (
    <div className="scroll-y" style={{ flex: 1 }}>
      <PageHead label="OPERATIONAL · TRIAGE" title="Review queue" sub="Proposed changes the brain detected. Approve to merge into company logic."
        right={<span className="tag amber" style={{ height: 30 }}>{queue.length} pending</span>}/>
      <div style={{ padding: "26px 40px 50px", maxWidth: 780, margin: "0 auto" }}>
        {/* progress strip */}
        <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>Today's review progress</span>
              <span style={{ fontFamily: "var(--font-grotesk)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "var(--ink-3)" }}>{done} / {total}</span>
            </div>
            <div className="meter" style={{ height: 7 }}><i style={{ width: `${(done / total) * 100}%`, background: "var(--green)" }}/></div>
          </div>
          <div style={{ width: 1, height: 36, background: "var(--line)" }}/>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.03em" }}>~30s</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>avg per item</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {queue.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--green-soft)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
              <I.check style={{ width: 26, color: "var(--green)" }}/>
            </div>
            <h2 style={{ fontSize: 22 }}>Queue clear</h2>
            <p style={{ color: "var(--ink-3)", marginTop: 8 }}>Every proposed change has been reviewed. The brain is up to date.</p>
          </div>
        ) : queue.map(r => <ReviewCard key={r.id} r={r} onResolve={onResolve}/>)}
        </div>
      </div>
    </div>
  );
}

/* ================= SOURCES ================= */
function SourceCard({ id }) {
  const h = SOURCE_HEALTH[id]; const s = SOURCES[id];
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 46, height: 46, borderRadius: 12, background: "var(--cream)", display: "grid", placeItems: "center", flex: "none" }}><SrcIcon id={id} size={26}/></span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em" }}>{s.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3, whiteSpace: "nowrap" }}>
            <span className="statusdot live"/><span style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 600 }}>Connected</span>
            <span style={{ fontSize: 12.5, color: "var(--ink-4)" }}>· synced {h.sync}</span>
          </div>
        </div>
        {h.pending > 0 && <span className="tag amber" style={{ marginLeft: "auto", flex: "none" }}>{h.pending} pending</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
        <Mini label="Knowledge" value={h.extracted}/>
        <Mini label="Channels" value={`${h.channels} active`}/>
      </div>
      <div style={{ marginTop: 16, display: "flex", alignItems: "flex-end", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span className="mono" style={{ fontSize: 9.5 }}>HEALTH</span><span style={{ fontFamily: "var(--font-grotesk)", fontVariantNumeric: "tabular-nums", fontSize: 11, color: "var(--ink-3)" }}>{h.health}%</span></div>
          <div className="meter"><i style={{ width: `${h.health}%`, background: "var(--green)" }}/></div>
        </div>
        <div style={{ flex: "none" }}>
          <div className="mono" style={{ fontSize: 9.5, marginBottom: 4, textAlign: "right" }}>7D INGEST</div>
          <Sparkline data={h.spark} w={72} h={22} color="var(--green)"/>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: "center" }}>Manage</button>
        <button className="btn btn-ghost btn-sm" style={{ justifyContent: "center" }}>View knowledge <I.arrow style={{ width: 14 }}/></button>
      </div>
    </div>
  );
}
function Mini({ label, value }) {
  return (
    <div style={{ padding: "10px 13px", background: "var(--cream)", borderRadius: 9 }}>
      <div className="mono" style={{ fontSize: 9.5 }}>{label}</div>
      <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 4, letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}
function SourcesPage() {
  const ids = Object.keys(SOURCES);
  const totalPending = ids.reduce((a, id) => a + SOURCE_HEALTH[id].pending, 0);
  const avgHealth = Math.round(ids.reduce((a, id) => a + SOURCE_HEALTH[id].health, 0) / ids.length);
  const stats = [
    { label: "Sources connected", value: `${ids.length} / ${ids.length}` },
    { label: "Avg. health", value: `${avgHealth}%` },
    { label: "Pending items", value: totalPending },
    { label: "Knowledge extracted", value: "378" },
  ];
  return (
    <div className="scroll-y" style={{ flex: 1 }}>
      <PageHead label="CONNECTED · 5 OF 5 HEALTHY" title="Sources" sub="Where your brain reads from. Read-only, synced continuously."
        right={<Btn variant="outline" size="sm" icon={<I.plus style={{ width: 15 }}/>}>Add source</Btn>}/>
      <div style={{ padding: "26px 40px 50px", maxWidth: 1180, margin: "0 auto" }}>
        {/* stat strip */}
        <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", marginBottom: 18 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ padding: "16px 20px", borderLeft: i ? "1px solid var(--line)" : "none" }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {ids.map(id => <SourceCard key={id} id={id}/>)}
        </div>
      </div>
    </div>
  );
}

/* ================= SKILLS ================= */
function SkillsPage() {
  const [query, setQuery] = useState("");
  const list = SKILLS.filter(s => s.name.includes(query.toLowerCase()));
  return (
    <div className="scroll-y" style={{ flex: 1 }}>
      <PageHead label="REGISTRY · 37 SKILLS · MCP-READY" title="Skills" sub="Executable capabilities your agents call. Versioned, with full source lineage."
        right={<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="searchbar" style={{ minWidth: 220, height: 38 }}>
            <I.search style={{ width: 16, flex: "none" }}/>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search skills…"/>
          </div>
          <Btn variant="solid" size="sm" icon={<I.plus style={{ width: 15 }}/>}>New skill</Btn>
        </div>}/>
      <div style={{ padding: "26px 40px 50px", maxWidth: 1100, margin: "0 auto" }}>
        {/* stat strip */}
        <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", marginBottom: 18 }}>
          {[["37", "Total skills"], ["31", "Stable"], ["4", "In review"], ["11.6k", "Calls · 30d"]].map(([v, l], i) => (
            <div key={l} style={{ padding: "16px 20px", borderLeft: i ? "1px solid var(--line)" : "none" }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{v}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2.6fr 0.5fr 0.75fr 0.95fr 0.85fr 52px", gap: 14, padding: "12px 22px", borderBottom: "1px solid var(--line)", background: "var(--paper)" }}>
            {["SKILL", "VERSION", "SOURCE LINEAGE", "CALLS · 30D", "STATUS", ""].map(h => <span key={h} className="mono" style={{ fontSize: 9.5 }}>{h}</span>)}
          </div>
          {list.map((s, i) => (
            <div key={s.name} className="row-h" style={{ display: "grid", gridTemplateColumns: "2.6fr 0.5fr 0.75fr 0.95fr 0.85fr 52px", gap: 14, padding: "14px 22px", alignItems: "center",
              borderBottom: i < list.length - 1 ? "1px solid var(--line-soft)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--cream)", display: "grid", placeItems: "center", flex: "none", color: "var(--accent)" }}><I.skills style={{ width: 16 }}/></span>
                <span style={{ fontFamily: "var(--font-grotesk)", fontVariantNumeric: "tabular-nums", fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
              </div>
              <span className="tag" style={{ width: "fit-content", fontFamily: "var(--font-grotesk)", fontVariantNumeric: "tabular-nums" }}>{s.v}</span>
              <div style={{ display: "flex", gap: 5 }}>{s.src.map(id => <SrcIcon key={id} id={id} size={18}/>)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <Sparkline data={s.spark} w={58} h={20} fill={false} color="var(--ink-3)" strokeW={1.4}/>
                <span style={{ fontFamily: "var(--font-grotesk)", fontVariantNumeric: "tabular-nums", fontSize: 13, color: "var(--ink-2)", fontWeight: 600 }}>{s.calls}</span>
              </div>
              <StatusTag status={s.status}/>
              <button className="btn btn-ghost btn-sm" style={{ padding: "0 6px", justifyContent: "flex-end", color: "var(--ink-3)" }}><I.diff style={{ width: 15 }}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= SETTINGS ================= */
const MEMBERS = [
  { name: "Dana Reyes", color: "#C2603A", role: "Admin", email: "dana@riverline.io", you: true },
  { name: "Marcus Lee", color: "#3F6B8F", role: "Editor", email: "marcus@riverline.io" },
  { name: "Priya Shah", color: "#6B8F3F", role: "Editor", email: "priya@riverline.io" },
  { name: "Sam Okafor", color: "#8F5F3F", role: "Viewer", email: "sam@riverline.io" },
];
function SettingsPage() {
  const [tab, setTab] = useState("general");
  return (
    <div className="scroll-y" style={{ flex: 1 }}>
      <PageHead label="WORKSPACE" title="Settings"
        right={<Segmented value={tab} options={[{ value: "general", label: "General" }, { value: "members", label: "Members" }, { value: "usage", label: "Usage" }]} onChange={setTab}/>}/>
      <div style={{ padding: "26px 40px 50px", maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {tab === "general" && <>
          <div className="card" style={{ padding: 24 }}>
            <Mono style={{ marginBottom: 16 }}>WORKSPACE</Mono>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <SetRow label="Workspace name" value="Riverline"/>
              <SetRow label="Workspace URL" value="riverline.io" mono/>
              <SetRow label="Plan" value="Pro · 12 seats"/>
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <Mono>BRAIN ENDPOINT</Mono>
              <span className="tag green" style={{ marginLeft: 10, height: 20, fontSize: 10.5 }}>Live</span>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>Point your agents and MCP clients here to query the brain.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--solid)", borderRadius: 11 }}>
              <span style={{ fontFamily: "var(--font-grotesk)", fontVariantNumeric: "tabular-nums", fontSize: 13, color: "var(--solid-ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>https://riverline.hephaestou.com/mcp</span>
              <button className="btn btn-sm" style={{ height: 30, background: "rgba(255,255,255,0.12)", color: "var(--solid-ink)" }}><I.link style={{ width: 13 }}/> Copy</button>
            </div>
          </div>
        </>}

        {tab === "members" && (
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
              <div><div style={{ fontWeight: 700, fontSize: 15 }}>Members</div><div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>{MEMBERS.length} of 12 seats used</div></div>
              <Btn variant="solid" size="sm" icon={<I.plus style={{ width: 15 }}/>} style={{ marginLeft: "auto" }}>Invite</Btn>
            </div>
            {MEMBERS.map((m, i) => (
              <div key={m.email} className="row-h" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", borderTop: i ? "1px solid var(--line-soft)" : "none" }}>
                <Avatar name={m.name} color={m.color} size={34}/>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>{m.name}{m.you && <span className="tag" style={{ height: 18, fontSize: 10, padding: "0 6px" }}>You</span>}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{m.email}</div>
                </div>
                <span className="tag" style={{ color: m.role === "Admin" ? "var(--accent-ink)" : "var(--ink-2)" }}>{m.role}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "usage" && (
          <div className="card" style={{ padding: 24 }}>
            <Mono style={{ marginBottom: 16 }}>THIS MONTH</Mono>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {[["Brain queries", "18.4k", [12,14,13,16,18,17,18]], ["MCP calls", "42.7k", [30,34,38,36,40,43,43]], ["Skills served", "37", [28,30,32,34,35,36,37]]].map(([l, v, sp]) => (
                <div key={l} style={{ padding: 16, background: "var(--cream)", borderRadius: 11 }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 27, letterSpacing: "-0.03em" }}>{v}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2, marginBottom: 10 }}>{l}</div>
                  <Sparkline data={sp} w={120} h={28} color="var(--accent)"/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function SetRow({ label, value, mono }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--line-soft)" }}>
      <span style={{ fontSize: 14, color: "var(--ink-3)", width: 180 }}>{label}</span>
      <span style={{ fontSize: 14.5, fontWeight: 600, fontFamily: mono ? "var(--font-mono)" : "inherit" }}>{value}</span>
      <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>Edit</button>
    </div>
  );
}

/* ================= SHELL ================= */
function Dashboard({ onLogout }) {
  const [page, setPage] = useState("brain");
  const [queue, setQueue] = useState(REVIEWS);
  const [toast, setToast] = useState(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSeed, setChatSeed] = useState(null);
  const resolve = (id, verdict) => {
    setQueue(q => q.filter(r => r.id !== id));
    setToast(verdict === "approve" ? "Approved · merged into the brain" : "Rejected · change discarded");
    setTimeout(() => setToast(null), 2600);
  };
  const openBrain = (seed) => { if (seed && typeof seed === "string") setChatSeed(seed); setChatOpen(true); };
  useEffect(() => {}, []);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen(o => !o); }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") { e.preventDefault(); setChatOpen(o => !o); }
      if (e.key === "Escape") { setCmdOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="screen" style={{ flexDirection: "row", background: "var(--ivory)" }}>
      <Sidebar page={page} setPage={setPage} reviewCount={queue.length} onLogout={onLogout} onOpenCmd={() => setCmdOpen(true)} collapsed={collapsed}/>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar page={page} setPage={setPage} reviewCount={queue.length} onOpenCmd={() => setCmdOpen(true)} collapsed={collapsed} onToggleSidebar={() => setCollapsed(c => !c)}/>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {page === "brain" && <BrainPage setPage={setPage} onAskBrain={openBrain}/>}
          {page === "decisions" && <DecisionsPage/>}
          {page === "reviews" && <ReviewsPage queue={queue} onResolve={resolve}/>}
          {page === "sources" && <SourcesPage/>}
          {page === "skills" && <SkillsPage/>}
          {page === "settings" && <SettingsPage/>}
        </div>
      </div>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} setPage={setPage} onAskBrain={openBrain}/>
      <BrainChat open={chatOpen} onOpen={() => setChatOpen(true)} onClose={() => setChatOpen(false)} seed={chatSeed} clearSeed={() => setChatSeed(null)}/>
      {toast && (
        <div className="fade-up" style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 50,
          background: "var(--solid)", color: "var(--solid-ink)", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600,
          boxShadow: "var(--sh-3)", display: "flex", alignItems: "center", gap: 10 }}>
          <I.check style={{ width: 17, color: "var(--accent)" }}/> {toast}
        </div>
      )}
    </div>
  );
}

window.Dashboard = Dashboard;
