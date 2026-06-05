/* ============================================================
   HEPHAESTOU V2 — BRAIN CHAT
   Floating action button + slide-up conversational panel
   ============================================================ */

const BRAIN_ANSWERS = [
  { match: /refund|premium/i,
    text: "Premium customers have a 45-day refund window — 15 days beyond standard. Past 45 days, refunds need manager approval in #cs-escalations. Damaged-item claims under $200 auto-issue a replacement.",
    sources: [["notion", "Policy Library"], ["slack", "#cs-escalations"]], conf: 96 },
  { match: /discount|enterprise|deal/i,
    text: "Discounts above 20% on annual contracts require VP Finance sign-off before the quote is sent. Below 20%, deal owners can approve directly in #deal-desk.",
    sources: [["slack", "#deal-desk"]], conf: 78 },
  { match: /incident|escalat|on-call|oncall/i,
    text: "A Sev-2 incident unacknowledged for 30 minutes auto-transfers ownership to the on-call engineering manager. Escalations route to #cs-escalations with a 2-hour SLA.",
    sources: [["jira", "INC project"], ["slack", "#incidents"]], conf: 91 },
  { match: /shipment|damaged|replace/i,
    text: "Claims that an item arrived damaged auto-issue a replacement under $200 with photo evidence — no escalation required. Above $200 routes to a support lead.",
    sources: [["zendesk", "Refunds view"]], conf: 89 },
];
const DEFAULT_ANSWER = {
  text: "I searched across all five sources but couldn't find a confident answer. Try rephrasing, or connect more channels so I can learn this.",
  sources: [], conf: 41 };

function answerFor(q) {
  return BRAIN_ANSWERS.find(a => a.match.test(q)) || DEFAULT_ANSWER;
}

const CHAT_SUGGEST = [
  "What's our refund policy for premium customers?",
  "How do enterprise discounts get approved?",
  "When do incidents escalate to engineering?",
];

function BrainChat({ open, onOpen, onClose, seed, clearSeed }) {
  const [msgs, setMsgs] = useState([
    { role: "brain", text: "Hi Dana — I'm Riverline's brain. Ask me anything your team has decided, and I'll answer with sources.", sources: [], conf: null },
  ]);
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  const send = useCallback((text) => {
    const query = (text != null ? text : q).trim();
    if (!query || typing) return;
    setQ("");
    setMsgs(m => [...m, { role: "you", text: query }]);
    setTyping(true);
    setTimeout(() => {
      const a = answerFor(query);
      setMsgs(m => [...m, { role: "brain", ...a }]);
      setTyping(false);
    }, 850);
  }, [q, typing]);

  // open with a seeded question
  useEffect(() => {
    if (open && seed) { send(seed); clearSeed && clearSeed(); }
  }, [open, seed]);

  // autoscroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing, open]);

  return (
    <>
      {/* FAB */}
      <button className="brain-fab" onClick={onOpen} title="Ask the brain (⌘/)" style={{ display: open ? "none" : "grid" }}>
        <I.brain style={{ width: 26 }}/>
        <span className="brain-fab-ping"/>
      </button>

      {/* panel */}
      {open && (
        <div className="brain-panel">
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "15px 18px", borderBottom: "1px solid var(--line)" }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", flex: "none", boxShadow: "0 4px 12px var(--accent-glow)" }}><I.brain style={{ width: 19 }}/></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: "-0.01em" }}>Riverline brain</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)" }}><span className="statusdot live"/> Reading 5 sources · live</div>
            </div>
            <button className="iconbtn" onClick={onClose}><I.x/></button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="scroll-y" style={{ flex: 1, padding: "18px", display: "flex", flexDirection: "column", gap: 14 }}>
            {msgs.map((m, i) => <ChatMsg key={i} m={m}/>)}
            {typing && (
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", flex: "none" }}><I.brain style={{ width: 15 }}/></span>
                <div className="typing"><i/><i/><i/></div>
              </div>
            )}
            {msgs.length === 1 && !typing && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
                {CHAT_SUGGEST.map(s => (
                  <button key={s} onClick={() => send(s)} className="chat-suggest">{s}<I.arrow style={{ width: 14 }}/></button>
                ))}
              </div>
            )}
          </div>

          {/* input */}
          <div style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--paper-2)", border: "1px solid var(--line-2)", borderRadius: 12, padding: "5px 5px 5px 14px" }}>
              <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Ask the brain…" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14.5, height: 34 }}/>
              <button className="btn btn-accent btn-sm" style={{ height: 34, width: 34, padding: 0, justifyContent: "center" }} onClick={() => send()}><I.arrow style={{ width: 16 }}/></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChatMsg({ m }) {
  if (m.role === "you") {
    return (
      <div style={{ alignSelf: "flex-end", maxWidth: "82%", background: "var(--solid)", color: "var(--solid-ink)", padding: "10px 14px", borderRadius: "14px 14px 4px 14px", fontSize: 14, lineHeight: 1.5 }}>
        {m.text}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
      <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", flex: "none", marginTop: 2 }}><I.brain style={{ width: 15 }}/></span>
      <div style={{ minWidth: 0 }}>
        <div style={{ background: "var(--cream)", padding: "11px 14px", borderRadius: "4px 14px 14px 14px", fontSize: 14, lineHeight: 1.55, color: "var(--ink)" }}>{m.text}</div>
        {(m.sources && m.sources.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}>
            {m.sources.map(([sid, where], i) => (
              <span key={i} className="chip"><SrcIcon id={sid} size={13}/> {where}</span>
            ))}
            {m.conf != null && <span className="chip accent">{m.conf}% confident</span>}
          </div>
        )}
      </div>
    </div>
  );
}

window.BrainChat = BrainChat;
