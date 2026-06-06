import type { SourceActivityMap } from "@/features/sources/types";

/** Live ingestion targets per source. Verbs and read targets mirror the
 * connected scopes from onboarding (channels, pages, repos, projects, views)
 * so the "Reading now" status reads like real continuous syncing. */
export const SOURCE_ACTIVITY: SourceActivityMap = {
  slack: {
    verb: "Reading",
    unit: "channel",
    targets: ["#cs-escalations", "#incidents", "#refunds-policy", "#deal-desk", "#eng-oncall"],
  },
  notion: {
    verb: "Indexing",
    unit: "page",
    targets: ["Support Playbook", "Ops Runbooks", "Policy Library", "Eng Handbook"],
  },
  github: {
    verb: "Scanning",
    unit: "repo",
    targets: ["payments-core", "dispute-engine", "runbooks"],
  },
  jira: {
    verb: "Reading",
    unit: "project",
    targets: ["Incident Response", "Platform"],
  },
  zendesk: {
    verb: "Analyzing",
    unit: "view",
    targets: ["Escalations", "Disputes", "Refunds"],
  },
};
