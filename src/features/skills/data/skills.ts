import type { Skill } from "@/features/skills/types";

/** The 6 static skills from the prototype (js/dash-data.jsx). */
export const SKILLS: Skill[] = [
  { name: "premium-refund-policy", v: "v4", src: ["notion", "slack"], calls: "2.1k", updated: "2d ago", status: "stable", spark: [120, 160, 180, 210, 240, 260, 290] },
  { name: "dispute-escalation", v: "v7", src: ["slack", "zendesk"], calls: "5.4k", updated: "4d ago", status: "stable", spark: [300, 340, 420, 460, 520, 580, 640] },
  { name: "incident-ownership", v: "v2", src: ["jira", "github"], calls: "840", updated: "6h ago", status: "active", spark: [40, 55, 70, 90, 110, 130, 160] },
  { name: "chargeback-triage", v: "v3", src: ["github"], calls: "120", updated: "12m ago", status: "draft", spark: [0, 0, 10, 20, 40, 80, 120] },
  { name: "enterprise-discount-approval", v: "v1", src: ["slack"], calls: "310", updated: "1d ago", status: "review", spark: [60, 90, 120, 160, 200, 260, 310] },
  { name: "damaged-shipment-replace", v: "v5", src: ["zendesk"], calls: "1.9k", updated: "3d ago", status: "stable", spark: [180, 200, 210, 230, 240, 250, 260] },
];
