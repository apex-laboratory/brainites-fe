import type { AnswerSource, BrainAnswer } from "@/features/brain-chat/types";

/**
 * Static brain answers from the prototype (js/brain-chat.jsx). Local regex
 * matching covers refund, discount, incident, and shipment questions.
 */
export const BRAIN_ANSWERS: BrainAnswer[] = [
  {
    match: /refund|premium/i,
    text: "Premium customers have a 45-day refund window — 15 days beyond standard. Past 45 days, refunds need manager approval in #cs-escalations. Damaged-item claims under $200 auto-issue a replacement.",
    sources: [
      ["notion", "Policy Library"],
      ["slack", "#cs-escalations"],
    ],
    conf: 96,
  },
  {
    match: /discount|enterprise|deal/i,
    text: "Discounts above 20% on annual contracts require VP Finance sign-off before the quote is sent. Below 20%, deal owners can approve directly in #deal-desk.",
    sources: [["slack", "#deal-desk"]],
    conf: 78,
  },
  {
    match: /incident|escalat|on-call|oncall/i,
    text: "A Sev-2 incident unacknowledged for 30 minutes auto-transfers ownership to the on-call engineering manager. Escalations route to #cs-escalations with a 2-hour SLA.",
    sources: [
      ["jira", "INC project"],
      ["slack", "#incidents"],
    ],
    conf: 91,
  },
  {
    match: /shipment|damaged|replace/i,
    text: "Claims that an item arrived damaged auto-issue a replacement under $200 with photo evidence — no escalation required. Above $200 routes to a support lead.",
    sources: [["zendesk", "Refunds view"]],
    conf: 89,
  },
];

export const DEFAULT_ANSWER: {
  text: string;
  sources: AnswerSource[];
  conf: number;
} = {
  text: "I searched across all five sources but couldn't find a confident answer. Try rephrasing, or connect more channels so I can learn this.",
  sources: [],
  conf: 41,
};

export const CHAT_SUGGESTIONS: string[] = [
  "What's our refund policy for premium customers?",
  "How do enterprise discounts get approved?",
  "When do incidents escalate to engineering?",
];
