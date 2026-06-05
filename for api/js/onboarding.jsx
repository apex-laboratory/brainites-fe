/* ============================================================
   HEPHAESTOU V2 — ONBOARDING FLOW
   Welcome · Company · Connect · Configure · Build · First Question
   Canvas 1440 x 900
   ============================================================ */

const CHANNELS = {
  slack:   ["#cs-escalations", "#incidents", "#refunds-policy", "#deal-desk", "#eng-oncall"],
  notion:  ["Support Playbook", "Ops Runbooks", "Policy Library", "Eng Handbook"],
  github:  ["payments-core", "dispute-engine", "runbooks"],
  jira:    ["Incident Response", "Platform"],
  zendesk: ["Escalations", "Disputes", "Refunds"],
};
const SRC_META = {
  slack:   { tag: "Conversations & decisions", count: "3,412", unit: "messages", reads: ["#cs-escalations", "#incidents", "#deal-desk"], extra: 15, mono: true, est: 84 },
  notion:  { tag: "Policies & playbooks",       count: "284",   unit: "pages",        reads: ["Policy Library", "Support Playbook", "Ops Runbooks"], extra: 3, est: 52 },
  github:  { tag: "Code reviews & runbooks",     count: "1,120", unit: "PRs & issues", reads: ["payments-core", "dispute-engine"], extra: 1, mono: true, est: 37 },
  jira:    { tag: "Tickets & incidents",          count: "640",  unit: "tickets",      reads: ["Incident Response", "Platform"], extra: 0, est: 44 },
  zendesk: { tag: "Support patterns",             count: "2,980", unit: "tickets",     reads: ["Escalations", "Disputes", "Refunds"], extra: 1, est: 61 },
};

/* ---------------- Setup frame (two-pane with vertical stepper) ---------------- */
const SETUP_STEPS = [
  { key: "company",   label: "Your company",    sub: "About your team",      icon: I.brain },
  { key: "connect",   label: "Connect sources", sub: "Slack, Notion & more", icon: I.sources },
  { key: "configure", label: "Configure",       sub: "Scope the knowledge",  icon: I.settings },
  { key: "build",     label: "Build the brain", sub: "Extract decisions",    icon: I.spark },
];

function Stepper({ active }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {SETUP_STEPS.map((s, i) => {
        const done = i < active, current = i === active;
        return (
          <div key={s.key} style={{ display: "flex", gap: 13, position: "relative", alignItems: "stretch" }}>
            {/* indicator + connector */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none", width: 30 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", flex: "none", transition: "all .3s var(--ease)",
                background: done ? "var(--accent)" : current ? "var(--paper-2)" : "transparent",
                border: current ? "2px solid var(--accent)" : done ? "none" : "2px solid var(--line-2)",
                color: done ? "#fff" : current ? "var(--accent)" : "var(--ink-4)", fontWeight: 700, fontSize: 13 }}>
                {done ? <I.check style={{ width: 15 }}/> : i + 1}
              </div>
              {i < SETUP_STEPS.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 24, margin: "5px 0", background: done ? "var(--accent)" : "var(--line-2)", transition: "background .3s", borderRadius: 2 }}/>}
            </div>
            {/* label */}
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 24, paddingTop: 5 }}>
              <div style={{ fontSize: 14, fontWeight: current || done ? 600 : 500, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: current ? "var(--ink)" : done ? "var(--ink-2)" : "var(--ink-4)" }}>{s.label}</div>
              <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 3 }}>{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OnbFrame({ stepIndex, title, sub, children, onBack, onNext, nextLabel = "Continue", canNext = true, footerNote, hideBack }) {
  return (
    <div className="screen" style={{ flexDirection: "row", background: "var(--ivory)" }}>
      {/* LEFT rail */}
      <div style={{ width: 312, flex: "none", background: "var(--cream)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", padding: "34px 32px" }}>
        <Logo/>
        <div style={{ marginTop: 44 }}>
          <div className="sec-label" style={{ padding: 0, margin: "0 0 6px" }}>Setup</div>
          <h2 style={{ fontSize: 21, letterSpacing: "-0.02em", marginBottom: 28 }}>Build your brain</h2>
          <Stepper active={stepIndex}/>
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 9, padding: "12px 14px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--cream)", display: "grid", placeItems: "center", flex: "none", color: "var(--accent)" }}><I.help style={{ width: 17 }}/></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Need a hand?</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Takes about 2 minutes</div>
          </div>
        </div>
      </div>

      {/* RIGHT content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="scroll-y" style={{ flex: 1, padding: "0 48px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", paddingTop: 56, paddingBottom: 40 }}>
            <div className="fade-up">
              <h1 className="display" style={{ fontSize: 34 }}>{title}</h1>
              {sub && <p style={{ color: "var(--ink-3)", fontSize: 16, lineHeight: 1.5, marginTop: 12, maxWidth: 540 }}>{sub}</p>}
            </div>
            <div className="fade-up d1" style={{ marginTop: 30 }}>{children}</div>
          </div>
        </div>
        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px 48px", borderTop: "1px solid var(--line-soft)", background: "color-mix(in srgb, var(--ivory) 86%, transparent)" }}>
          {!hideBack && <button className="btn btn-ghost" onClick={onBack}><I.arrowL/> Back</button>}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}>
            {footerNote && <span style={{ fontSize: 13, color: "var(--ink-4)", fontWeight: 500 }}>{footerNote}</span>}
            <Btn variant="solid" arrow onClick={onNext} disabled={!canNext} style={!canNext ? { opacity: 0.4, pointerEvents: "none" } : {}}>{nextLabel}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 0 · Welcome ---------------- */
function StepWelcome({ onNext }) {
  const preview = [
    { icon: I.sources, t: "Connect your tools", d: "Slack, Notion, GitHub, Jira & Zendesk — read-only." },
    { icon: I.spark, t: "Build your brain", d: "We extract the decisions your team already made." },
    { icon: I.brain, t: "Ask anything", d: "Your agents query company knowledge with sources." },
  ];
  return (
    <div className="screen" style={{ background: "var(--ivory)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 30, left: 44 }}><Logo/></div>
      <div style={{ width: 880, maxWidth: "92%", padding: "0 40px", textAlign: "center" }}>
        <div className="sec-label fade-up" style={{ padding: 0 }}>Welcome to Hephaestou</div>
        <h1 className="display fade-up d1" style={{ fontSize: 60, marginTop: 18, lineHeight: 1.0 }}>
          Let's build <span className="serif-italic" style={{ fontWeight: 400 }}>Riverline's</span> brain
        </h1>
        <p className="fade-up d2" style={{ fontSize: 19, color: "var(--ink-3)", marginTop: 20, lineHeight: 1.5, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          In three quick steps, we'll turn the knowledge buried in your tools into a brain your team and agents can ask.
        </p>
        <div className="fade-up d3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 46, textAlign: "left" }}>
          {preview.map((p, i) => (
            <div key={i} className="card sheen" style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent-soft)", color: "var(--accent-ink)", display: "grid", placeItems: "center", flex: "none" }}><p.icon style={{ width: 18 }}/></span>
                <span style={{ fontFamily: "var(--font-grotesk)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "var(--ink-4)", fontWeight: 700 }}>0{i + 1}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.01em", marginTop: 14 }}>{p.t}</div>
              <div style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 5, lineHeight: 1.5 }}>{p.d}</div>
            </div>
          ))}
        </div>
        <div className="fade-up d4" style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40 }}>
          <Btn variant="solid" size="lg" arrow onClick={onNext}>Get started</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 1 · Company ---------------- */
const USE_CASES = [
  { id: "support", t: "Customer Support", d: "Refunds, disputes, escalations", icon: I.review },
  { id: "ops", t: "Operations", d: "Runbooks, incidents, approvals", icon: I.bolt },
  { id: "eng", t: "Engineering", d: "Onboarding, code review, on-call", icon: I.skills },
  { id: "agents", t: "Internal Agents", d: "Tools that act on your behalf", icon: I.spark },
];
function StepCompany({ data, set, onBack, onNext }) {
  const sizes = ["1–10", "11–50", "51–200", "200+"];
  return (
    <OnbFrame stepIndex={0} title="Tell us about your company"
      sub="We tailor your brain to how your team actually works." onBack={onBack} onNext={onNext}
      canNext={data.company && data.useCase}>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 620 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label className="field-label">Company name</label>
          <input className="input" value={data.company} onChange={e => set({ company: e.target.value })} placeholder="Acme Inc."/>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label className="field-label">Team size</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {sizes.map(s => (
              <div key={s} className="opt" data-on={data.size === s} onClick={() => set({ size: s })}
                style={{ justifyContent: "center", padding: "14px 0", fontWeight: 600 }}>{s}</div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label className="field-label">Primary use case</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {USE_CASES.map(u => (
              <div key={u.id} className="opt" data-on={data.useCase === u.id} onClick={() => set({ useCase: u.id })} style={{ alignItems: "flex-start" }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: data.useCase === u.id ? "var(--accent)" : "var(--cream)",
                  color: data.useCase === u.id ? "#fff" : "var(--ink-2)", display: "grid", placeItems: "center", flex: "none", transition: "all .15s" }}>
                  <u.icon style={{ width: 18, height: 18 }}/>
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: "-0.01em" }}>{u.t}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>{u.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OnbFrame>
  );
}

/* ---------------- Step 2 · Connect ---------------- */
function ConnectCard({ id, status, onConnect }) {
  // status: idle | connecting | connected
  const s = SOURCES[id], m = SRC_META[id];
  const connected = status === "connected", connecting = status === "connecting";
  return (
    <div className={cx("card sheen", connecting && "connecting")} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 13,
      transform: connected ? "translateY(-2px)" : "none",
      boxShadow: connected ? "var(--sh-2)" : "var(--sh-1)",
      borderColor: connected ? "color-mix(in srgb, var(--green) 45%, var(--line))" : "var(--line)" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 46, height: 46, borderRadius: 12, flex: "none", display: "grid", placeItems: "center", transition: "background .3s",
          background: connected ? "color-mix(in srgb, var(--green) 13%, var(--paper-2))" : "var(--cream)" }}>
          <SrcIcon id={id} size={27}/>
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.015em" }}>{s.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 1 }}>{m.tag}</div>
        </div>
        {connected && <span className="statusdot live" style={{ animation: "pulseRing 2.2s infinite" }}/>}
      </div>

      {/* metric */}
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 25, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", marginRight: 8 }}>{m.count}</span>
        <span style={{ fontSize: 13, color: "var(--ink-3)", whiteSpace: "nowrap" }}>{m.unit}</span>
      </div>

      {/* what we'll read */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 26 }}>
        {m.reads.map(r => (
          <span key={r} className="tag" style={{ height: 24, padding: "0 9px", fontSize: 11.5, fontWeight: 500, color: "var(--ink-2)" }}>{r}</span>
        ))}
        {m.extra > 0 && <span className="tag" style={{ height: 24, padding: "0 9px", fontSize: 11.5, color: "var(--ink-4)", borderStyle: "dashed" }}>+{m.extra}</span>}
      </div>

      {/* action */}
      {connected ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 42, padding: "0 14px", borderRadius: 10, background: "var(--green-soft)", marginTop: 2 }}>
          <I.check style={{ width: 16, color: "var(--green)" }}/>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--green)" }}>Connected</span>
          <span style={{ fontSize: 12, color: "var(--ink-3)", marginLeft: "auto", fontFamily: "var(--font-grotesk)", fontVariantNumeric: "tabular-nums" }}>riverline.io</span>
        </div>
      ) : (
        <button className="btn btn-outline btn-sm" style={{ height: 42, justifyContent: "center", marginTop: 2 }} onClick={onConnect} disabled={connecting}>
          {connecting
            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ink-3)" }}><span className="statusdot sync"/> Connecting…</span>
            : <><I.link/> Connect {s.name}</>}
        </button>
      )}
    </div>
  );
}
function StepConnect({ data, set, onBack, onNext }) {
  const [connecting, setConnecting] = useState({});
  const ids = Object.keys(SOURCES);
  const connect = (id, delay = 0) => {
    setTimeout(() => {
      setConnecting(c => ({ ...c, [id]: true }));
      setTimeout(() => { setConnecting(c => ({ ...c, [id]: false })); set(d => ({ connected: { ...d.connected, [id]: true } })); }, 950);
    }, delay);
  };
  const statusOf = (id) => data.connected[id] ? "connected" : connecting[id] ? "connecting" : "idle";
  const count = ids.filter(id => data.connected[id]).length;
  const est = ids.filter(id => data.connected[id]).reduce((a, id) => a + SRC_META[id].est, 0);
  const allDone = count === ids.length;

  return (
    <OnbFrame stepIndex={1} title="Plug in where your decisions already live"
      sub="Read-only. Hephaestou never writes back to your tools." onBack={onBack} onNext={onNext}
      canNext={count > 0} footerNote={`${count} of ${ids.length} connected`} nextLabel={count ? "Continue" : "Connect a source"}>

      {/* summary bar */}
      <div className="card sheen" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <div style={{ display: "flex" }}>
          {ids.map((id, i) => (
            <span key={id} style={{ marginLeft: i ? -10 : 0, width: 34, height: 34, borderRadius: 9, border: "2px solid var(--paper)",
              background: data.connected[id] ? "var(--paper-2)" : "var(--cream)", display: "grid", placeItems: "center",
              opacity: data.connected[id] ? 1 : 0.5, transition: "opacity .3s, background .3s", filter: data.connected[id] ? "none" : "grayscale(0.6)" }}>
              <SrcIcon id={id} size={19}/>
            </span>
          ))}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
            {count === 0 ? "No sources connected yet" : `${count} of ${ids.length} sources connected`}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2, whiteSpace: "nowrap" }}>
            {count === 0 ? "Connect at least one to build your brain" : <>~<b style={{ color: "var(--accent-ink)", fontFamily: "var(--font-grotesk)", fontVariantNumeric: "tabular-nums" }}>{est}</b> decisions ready to extract</>}
          </div>
        </div>
        {!allDone && (
          <button className="btn btn-solid btn-sm" style={{ marginLeft: "auto" }} onClick={() => ids.forEach((id, i) => !data.connected[id] && connect(id, i * 180))}>
            <I.bolt style={{ width: 15 }}/> Connect all
          </button>
        )}
        {allDone && <span className="tag green" style={{ marginLeft: "auto", height: 30 }}><I.check style={{ width: 14 }}/> All connected</span>}
      </div>

      {/* cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {ids.map(id => (
          <ConnectCard key={id} id={id} status={statusOf(id)} onConnect={() => connect(id)}/>
        ))}
        {/* trust panel fills the grid + reassures */}
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, background: "var(--cream)", borderStyle: "dashed" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: "var(--paper-2)", display: "grid", placeItems: "center", color: "var(--accent)", border: "1px solid var(--line)" }}>
            <I.review style={{ width: 21 }}/>
          </span>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>Read-only & private</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
            Hephaestou only reads what you scope. We never post, edit, or delete in your tools — and you can revoke access anytime.
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: "auto", flexWrap: "wrap" }}>
            <span className="tag" style={{ height: 24, fontSize: 11 }}>SOC 2 Type II</span>
            <span className="tag" style={{ height: 24, fontSize: 11 }}>OAuth scoped</span>
          </div>
        </div>
      </div>
    </OnbFrame>
  );
}

/* ---------------- Step 3 · Configure ---------------- */
function StepConfigure({ data, set, onBack, onNext }) {
  const ranges = ["30 days", "90 days", "6 months", "All time"];
  const connectedIds = Object.keys(SOURCES).filter(id => data.connected[id]);
  const toggle = (id, ch) => {
    const cur = data.channels[id] || [];
    const next = cur.includes(ch) ? cur.filter(c => c !== ch) : [...cur, ch];
    set({ channels: { ...data.channels, [id]: next } });
  };
  return (
    <OnbFrame stepIndex={2} title="Choose what the brain should read"
      sub="Start narrow. You can widen your brain's coverage anytime." onBack={onBack} onNext={onNext}
      nextLabel="Build my brain">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card" style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
          <span className="sec-label" style={{ flex: "none", padding: 0, margin: 0 }}>Time range</span>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            {ranges.map(r => (
              <div key={r} className="opt" data-on={data.range === r} onClick={() => set({ range: r })}
                style={{ padding: "9px 16px", fontSize: 13.5, fontWeight: 600 }}>{r}</div>
            ))}
          </div>
        </div>
        {connectedIds.map(id => (
          <div key={id} className="card" style={{ padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <SrcIcon id={id} size={20}/>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{SOURCES[id].name}</span>
              <span style={{ fontSize: 12.5, color: "var(--ink-4)", marginLeft: 6 }}>
                {(data.channels[id] || []).length} selected
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {CHANNELS[id].map(ch => {
                const on = (data.channels[id] || []).includes(ch);
                return (
                  <button key={ch} onClick={() => toggle(id, ch)} className="tag"
                    style={{ height: 32, padding: "0 13px", fontSize: 13, cursor: "pointer",
                      borderColor: on ? "var(--accent)" : "var(--line-2)", background: on ? "var(--accent-soft)" : "var(--paper)",
                      color: on ? "var(--accent-ink)" : "var(--ink-2)" }}>
                    {on && <I.check style={{ width: 13, height: 13 }}/>}{ch}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </OnbFrame>
  );
}

/* ---------------- Step 5 · First Question ---------------- */
const FIRST_EXAMPLES = [
  "What happens when a premium customer requests a refund after 45 days?",
  "How do enterprise discounts get approved?",
  "When should incidents be escalated to engineering?",
];
function StepFirstQuestion({ data, onDone }) {
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState(null);
  const ask = (text) => { if (!text.trim()) return; setQ(text); setTimeout(() => setAsked(text), 80); };
  return (
    <div className="screen" style={{ background: "var(--ivory)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 30, left: 44 }}><Logo/></div>
      <div style={{ position: "absolute", top: 32, right: 44 }}><Mono>06 / 06</Mono></div>
      <div style={{ width: 820, maxWidth: "92%", padding: "0 20px" }}>
        {!asked ? (
          <div style={{ textAlign: "center" }} className="fade-up">
            <Mono bracket style={{ display: "inline-block" }}>YOUR BRAIN IS READY</Mono>
            <h1 className="display" style={{ fontSize: 56, marginTop: 22 }}>Ask it <span className="serif-italic" style={{ fontWeight: 400 }}>something</span>.</h1>
            <p style={{ fontSize: 18, color: "var(--ink-3)", marginTop: 16 }}>{data.company || "Your company"}'s knowledge is now one question away.</p>
          </div>
        ) : (
          <div className="fade-up" style={{ marginBottom: 24 }}>
            <Mono>YOU ASKED</Mono>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 8 }}>{asked}</div>
          </div>
        )}

        {/* input */}
        <div className="card" style={{ marginTop: asked ? 0 : 38, padding: 8, display: "flex", alignItems: "center", gap: 8, boxShadow: "var(--sh-2)", borderRadius: 16 }}>
          <I.brain style={{ width: 22, height: 22, color: "var(--accent)", marginLeft: 12, flex: "none" }}/>
          <input className="input" style={{ border: "none", background: "transparent", height: 56, fontSize: 17, boxShadow: "none" }}
            value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && ask(q)}
            placeholder="Ask your company brain…" autoFocus/>
          <button className="btn btn-accent btn-sm" style={{ height: 44, padding: "0 18px" }} onClick={() => ask(q)}>Ask <I.arrow style={{ width: 16 }}/></button>
        </div>

        {!asked ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18 }} className="fade-up d2">
            {FIRST_EXAMPLES.map(ex => (
              <button key={ex} onClick={() => ask(ex)} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, textAlign: "left", cursor: "pointer" }}>
                <I.spark style={{ width: 15, height: 15, color: "var(--accent)", flex: "none" }}/>
                <span style={{ fontSize: 15, color: "var(--ink-2)" }}>{ex}</span>
                <I.arrow style={{ width: 16, marginLeft: "auto", color: "var(--ink-4)" }}/>
              </button>
            ))}
          </div>
        ) : (
          <AnswerCard onDone={onDone}/>
        )}
      </div>
    </div>
  );
}
function AnswerCard({ onDone }) {
  return (
    <div className="card fade-up" style={{ marginTop: 16, padding: 26, borderRadius: 16 }}>
      <div style={{ fontSize: 17, lineHeight: 1.62, color: "var(--ink)" }}>
        Premium customers have a <b>45-day refund window</b> — 15 days beyond standard. After 45 days, refunds require
        manager approval in <b>#cs-escalations</b>. Damaged-item claims under $200 auto-issue a replacement without escalation.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <span className="mono">SOURCES</span>
        <span className="tag"><SrcIcon id="notion" size={14}/> Policy Library</span>
        <span className="tag"><SrcIcon id="slack" size={14}/> #cs-escalations</span>
        <span className="tag"><SrcIcon id="zendesk" size={14}/> Refunds view</span>
        <span className="tag accent" style={{ marginLeft: "auto" }}>96% confidence</span>
      </div>
      <div style={{ borderTop: "1px solid var(--line)", marginTop: 22, paddingTop: 20, display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 14, color: "var(--ink-3)" }}>That's your brain talking. There's a whole dashboard behind it.</div>
        <Btn variant="accent" arrow style={{ marginLeft: "auto" }} onClick={onDone}>Enter Hephaestou</Btn>
      </div>
    </div>
  );
}

/* ---------------- Orchestrator ---------------- */
function Onboarding({ onDone, calm }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ company: "Riverline", size: "51–200", useCase: "support",
    connected: {}, channels: { slack: CHANNELS.slack.slice(0, 3), notion: CHANNELS.notion.slice(0, 3),
      github: CHANNELS.github.slice(0, 2), jira: CHANNELS.jira, zendesk: CHANNELS.zendesk.slice(0, 2) },
    range: "90 days" });
  const set = (patch) => setData(d => ({ ...d, ...(typeof patch === "function" ? patch(d) : patch) }));
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));

  if (step === 0) return <StepWelcome onNext={next}/>;
  if (step === 1) return <StepCompany data={data} set={set} onBack={back} onNext={next}/>;
  if (step === 2) return <StepConnect data={data} set={set} onBack={back} onNext={next}/>;
  if (step === 3) return <StepConfigure data={data} set={set} onBack={back} onNext={next}/>;
  if (step === 4) return <BuildBrain calm={calm} onComplete={next}/>;
  return <StepFirstQuestion data={data} onDone={onDone}/>;
}

window.Onboarding = Onboarding;
