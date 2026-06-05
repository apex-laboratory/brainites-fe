import type { Review } from "@/features/reviews/types";

/** The 3 static review-queue items from the prototype (js/dash-data.jsx). */
export const REVIEWS: Review[] = [
  {
    id: "r1",
    title: "Refund window extended for premium tier",
    src: "slack",
    where: "#cs-escalations · 14 messages",
    kind: "Policy change",
    before: "Premium refund window: 30 days",
    after: "Premium refund window: 45 days",
    quote:
      "“Let's just give premium folks 45 days, support keeps eating these as one-offs anyway.”",
    who: "Dana R. · Head of CX",
    conf: 92,
  },
  {
    id: "r2",
    title: "Auto-accept chargebacks under $50",
    src: "github",
    where: "dispute-engine · PR #482",
    kind: "New skill",
    before: "All chargebacks manually reviewed",
    after: "Chargebacks < $50 auto-accepted",
    quote:
      "“Review cost exceeds the disputed amount below ~$50. Auto-accepting saves ~9 agent-hrs/wk.”",
    who: "Marcus L. · Payments",
    conf: 84,
  },
  {
    id: "r3",
    title: "Escalation SLA tightened to 2 hours",
    src: "zendesk",
    where: "Escalations view",
    kind: "Policy change",
    before: "Escalation SLA: 4 hours",
    after: "Escalation SLA: 2 hours",
    quote:
      "“We agreed in QBR to halve the escalation SLA for Enterprise accounts.”",
    who: "Priya S. · Support Ops",
    conf: 88,
  },
];
