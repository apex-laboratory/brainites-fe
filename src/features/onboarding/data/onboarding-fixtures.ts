import type { SetupStep, UseCase } from "@/features/onboarding/types";

/** Two-pane setup stepper definition. */
export const SETUP_STEPS: SetupStep[] = [
  { key: "company", label: "Your company", sub: "About your team", icon: "brain" },
  { key: "connect", label: "Connect sources", sub: "Slack, Notion & more", icon: "sources" },
  { key: "configure", label: "Configure", sub: "Scope the knowledge", icon: "settings" },
  { key: "build", label: "Build the brain", sub: "Extract decisions", icon: "sparkles" },
];

/** "Learning your world" step: progress checklist completed in sequence. */
export const LEARNING_STEPS: { t: string; d: string }[] = [
  { t: "Reading your sources", d: "Slack, Notion, GitHub, Jira, Zendesk, Google Drive" },
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
