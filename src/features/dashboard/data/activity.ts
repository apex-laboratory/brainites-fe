import type { ActivityItem } from "@/features/dashboard/types";

/** The 5 static activity items from the prototype (js/dash-data.jsx). */
export const ACTIVITY: ActivityItem[] = [
  { icon: "skill", txt: "New skill proposed", det: "chargeback-triage v3", src: "github", t: "12m" },
  { icon: "policy", txt: "Policy updated", det: "Premium refund window → 45 days", src: "notion", t: "2h" },
  { icon: "decision", txt: "Slack decision detected", det: "Incident ownership transfer", src: "slack", t: "6h" },
  { icon: "pattern", txt: "Zendesk pattern identified", det: "Damaged-shipment claims cluster", src: "zendesk", t: "9h" },
  { icon: "decision", txt: "Jira decision detected", det: "On-call handoff window", src: "jira", t: "1d" },
];
