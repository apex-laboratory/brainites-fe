import type { SourceId } from "@/types/common";
import type {
  SetupStep,
  SourceConnectMeta,
  UseCase,
} from "@/features/onboarding/types";

/** Selectable channels / pages / repos / views per source. */
export const CHANNELS: Record<SourceId, string[]> = {
  slack: ["#cs-escalations", "#incidents", "#refunds-policy", "#deal-desk", "#eng-oncall"],
  notion: ["Support Playbook", "Ops Runbooks", "Policy Library", "Eng Handbook"],
  github: ["payments-core", "dispute-engine", "runbooks"],
  jira: ["Incident Response", "Platform"],
  zendesk: ["Escalations", "Disputes", "Refunds"],
};

/** Channels pre-selected when the configure step opens, mirroring the
 * prototype's defaults. */
export const DEFAULT_CHANNELS: Record<SourceId, string[]> = {
  slack: CHANNELS.slack.slice(0, 3),
  notion: CHANNELS.notion.slice(0, 3),
  github: CHANNELS.github.slice(0, 2),
  jira: CHANNELS.jira,
  zendesk: CHANNELS.zendesk.slice(0, 2),
};

/** Per-source connect metadata (counts, reads, estimates). */
export const SOURCE_CONNECT_META: Record<SourceId, SourceConnectMeta> = {
  slack: { tag: "Conversations & decisions", count: "3,412", unit: "messages", reads: ["#cs-escalations", "#incidents", "#deal-desk"], extra: 15, est: 84 },
  notion: { tag: "Policies & playbooks", count: "284", unit: "pages", reads: ["Policy Library", "Support Playbook", "Ops Runbooks"], extra: 3, est: 52 },
  github: { tag: "Code reviews & runbooks", count: "1,120", unit: "PRs & issues", reads: ["payments-core", "dispute-engine"], extra: 1, est: 37 },
  jira: { tag: "Tickets & incidents", count: "640", unit: "tickets", reads: ["Incident Response", "Platform"], extra: 0, est: 44 },
  zendesk: { tag: "Support patterns", count: "2,980", unit: "tickets", reads: ["Escalations", "Disputes", "Refunds"], extra: 1, est: 61 },
};

/** Two-pane setup stepper definition. */
export const SETUP_STEPS: SetupStep[] = [
  { key: "company", label: "Your company", sub: "About your team", icon: "brain" },
  { key: "connect", label: "Connect sources", sub: "Slack, Notion & more", icon: "sources" },
  { key: "configure", label: "Configure", sub: "Scope the knowledge", icon: "settings" },
  { key: "build", label: "Build the brain", sub: "Extract decisions", icon: "sparkles" },
];

/** "Learning your world" step: progress checklist completed in sequence. */
export const LEARNING_STEPS: { t: string; d: string }[] = [
  { t: "Reading your sources", d: "Slack, Notion, GitHub, Jira, Zendesk" },
  { t: "Finding decisions & patterns", d: "Extracting resolutions, policies, runbooks" },
  { t: "Building connections", d: "Linking related topics and outcomes" },
  { t: "Almost there…", d: "Finalizing your brain" },
];

/** Company setup: team size options. */
export const TEAM_SIZES: string[] = ["1–10", "11–50", "51–200", "200+"];

/** Company setup: primary use case options. */
export const USE_CASES: UseCase[] = [
  { id: "support", t: "Customer Support", d: "Refunds, disputes, escalations", icon: "review" },
  { id: "ops", t: "Operations", d: "Runbooks, incidents, approvals", icon: "bolt" },
  { id: "eng", t: "Engineering", d: "Onboarding, code review, on-call", icon: "skills" },
  { id: "agents", t: "Internal Agents", d: "Tools that act on your behalf", icon: "sparkles" },
];

/** Configure step: time-range options. */
export const TIME_RANGES: string[] = ["30 days", "90 days", "6 months", "All time"];
