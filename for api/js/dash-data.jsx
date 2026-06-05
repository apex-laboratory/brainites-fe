/* ============================================================
   HEPHAESTOU V2 — DASHBOARD DATA + SHARED BITS
   ============================================================ */

const DECISIONS = [
  { id: "d1", title: "Premium refund exception", src: "notion", where: "Policy Library", status: "approved", conf: 96, cat: "Support", owner: "Dana Reyes", oc: "#C2603A", uses: "2.1k", updated: "2d ago",
    body: "Premium-tier customers receive a 45-day refund window — 15 days beyond standard. Beyond 45 days, refunds require manager approval.",
    rule: "IF customer.tier = premium AND days_since_purchase ≤ 45 THEN approve_refund() ELSE require_manager_approval()" },
  { id: "d2", title: "Stripe dispute escalation", src: "slack", where: "#cs-escalations", status: "approved", conf: 94, cat: "Support", owner: "Dana Reyes", oc: "#C2603A", uses: "5.4k", updated: "4d ago",
    body: "Card disputes route to #cs-escalations within 2 hours. Tier-1 agents cannot resolve disputes above $500 without lead sign-off.",
    rule: "IF event = card_dispute THEN route('#cs-escalations', sla='2h'); IF amount > 500 THEN require_lead_signoff()" },
  { id: "d3", title: "Incident ownership transfer", src: "jira", where: "INC project", status: "active", conf: 91, cat: "Engineering", owner: "Marcus Lee", oc: "#3F6B8F", uses: "840", updated: "6h ago",
    body: "If a Sev-2 incident is unacknowledged for 30 minutes, ownership transfers automatically to the on-call engineering manager.",
    rule: "IF incident.sev = 2 AND unacked_for > 30min THEN transfer_owner(oncall_em)" },
  { id: "d4", title: "Enterprise discount approval", src: "slack", where: "#deal-desk", status: "review", conf: 78, cat: "Sales", owner: "Priya Shah", oc: "#6B8F3F", uses: "310", updated: "1d ago",
    body: "Discounts above 20% on annual contracts require VP Finance sign-off before the quote is sent.",
    rule: "IF contract.term = annual AND discount > 0.20 THEN require_signoff('VP Finance')" },
  { id: "d5", title: "Damaged shipment replacement", src: "zendesk", where: "Refunds view", status: "approved", conf: 89, cat: "Support", owner: "Dana Reyes", oc: "#C2603A", uses: "1.9k", updated: "3d ago",
    body: "Claims that an item arrived damaged auto-issue a replacement under $200 with photo evidence — no escalation required.",
    rule: "IF claim = damaged AND value < 200 AND has_photo THEN auto_replace() ELSE escalate()" },
  { id: "d6", title: "On-call handoff window", src: "github", where: "runbooks", status: "active", conf: 88, cat: "Engineering", owner: "Marcus Lee", oc: "#3F6B8F", uses: "420", updated: "5d ago",
    body: "On-call handoffs happen Mondays at 10:00 PT. The outgoing engineer must clear all P1 incidents before handing off.",
    rule: "IF day = monday AND time = 10:00 PT THEN handoff_oncall(require: open_P1 = 0)" },
];

const REVIEWS = [
  { id: "r1", title: "Refund window extended for premium tier", src: "slack", where: "#cs-escalations · 14 messages",
    kind: "Policy change", before: "Premium refund window: 30 days", after: "Premium refund window: 45 days",
    quote: "\u201cLet's just give premium folks 45 days, support keeps eating these as one-offs anyway.\u201d", who: "Dana R. · Head of CX", conf: 92 },
  { id: "r2", title: "Auto-accept chargebacks under $50", src: "github", where: "dispute-engine · PR #482",
    kind: "New skill", before: "All chargebacks manually reviewed", after: "Chargebacks < $50 auto-accepted",
    quote: "\u201cReview cost exceeds the disputed amount below ~$50. Auto-accepting saves ~9 agent-hrs/wk.\u201d", who: "Marcus L. · Payments", conf: 84 },
  { id: "r3", title: "Escalation SLA tightened to 2 hours", src: "zendesk", where: "Escalations view",
    kind: "Policy change", before: "Escalation SLA: 4 hours", after: "Escalation SLA: 2 hours",
    quote: "\u201cWe agreed in QBR to halve the escalation SLA for Enterprise accounts.\u201d", who: "Priya S. · Support Ops", conf: 88 },
];

const ACTIVITY = [
  { icon: "skill", txt: "New skill proposed", det: "chargeback-triage v3", src: "github", t: "12m" },
  { icon: "policy", txt: "Policy updated", det: "Premium refund window → 45 days", src: "notion", t: "2h" },
  { icon: "decision", txt: "Slack decision detected", det: "Incident ownership transfer", src: "slack", t: "6h" },
  { icon: "pattern", txt: "Zendesk pattern identified", det: "Damaged-shipment claims cluster", src: "zendesk", t: "9h" },
  { icon: "decision", txt: "Jira decision detected", det: "On-call handoff window", src: "jira", t: "1d" },
];

const RECENT_Q = [
  "How do enterprise discounts get approved?",
  "What happens when a shipment arrives damaged?",
  "When should incidents be escalated to engineering?",
];

const SKILLS = [
  { name: "premium-refund-policy", v: "v4", src: ["notion", "slack"], calls: "2.1k", updated: "2d ago", status: "stable", spark: [120,160,180,210,240,260,290] },
  { name: "dispute-escalation", v: "v7", src: ["slack", "zendesk"], calls: "5.4k", updated: "4d ago", status: "stable", spark: [300,340,420,460,520,580,640] },
  { name: "incident-ownership", v: "v2", src: ["jira", "github"], calls: "840", updated: "6h ago", status: "active", spark: [40,55,70,90,110,130,160] },
  { name: "chargeback-triage", v: "v3", src: ["github"], calls: "120", updated: "12m ago", status: "draft", spark: [0,0,10,20,40,80,120] },
  { name: "enterprise-discount-approval", v: "v1", src: ["slack"], calls: "310", updated: "1d ago", status: "review", spark: [60,90,120,160,200,260,310] },
  { name: "damaged-shipment-replace", v: "v5", src: ["zendesk"], calls: "1.9k", updated: "3d ago", status: "stable", spark: [180,200,210,230,240,250,260] },
];

const SOURCE_HEALTH = {
  slack:   { sync: "4m ago", extracted: "184 decisions", pending: 3, health: 98, channels: 18, spark: [20,28,24,32,30,38,42] },
  notion:  { sync: "11m ago", extracted: "52 policies", pending: 0, health: 100, channels: 6, spark: [8,10,9,12,11,14,16] },
  github:  { sync: "2m ago", extracted: "37 skills", pending: 1, health: 96, channels: 4, spark: [12,14,18,16,22,26,30] },
  jira:    { sync: "26m ago", extracted: "44 decisions", pending: 2, health: 92, channels: 2, spark: [10,12,11,14,13,16,18] },
  zendesk: { sync: "8m ago", extracted: "61 patterns", pending: 0, health: 99, channels: 4, spark: [22,26,30,28,34,38,44] },
};

const STATUS_STYLE = {
  approved: { cls: "green", label: "Approved" },
  active:   { cls: "accent", label: "Active" },
  review:   { cls: "amber", label: "Needs review" },
  stable:   { cls: "green", label: "Stable" },
  draft:    { cls: "", label: "Draft" },
};

/* small reusable badge */
function StatusTag({ status }) {
  const s = STATUS_STYLE[status] || { cls: "", label: status };
  return <span className={cx("tag", s.cls)}>{s.label}</span>;
}

/* confidence pill */
function Conf({ v }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 96 }}>
      <div className="meter" style={{ flex: 1 }}><i style={{ width: `${v}%`, background: v >= 90 ? "var(--green)" : v >= 82 ? "var(--ink)" : "var(--amber)" }}/></div>
      <span style={{ fontFamily: "var(--font-grotesk)", fontVariantNumeric: "tabular-nums", fontSize: 12, fontWeight: 600, color: "var(--ink-3)" }}>{v}%</span>
    </div>
  );
}

Object.assign(window, { DECISIONS, REVIEWS, ACTIVITY, RECENT_Q, SKILLS, SOURCE_HEALTH, STATUS_STYLE, StatusTag, Conf });
