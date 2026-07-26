import type { SetupStep, UseCase } from "@/features/onboarding/types";

/** Two-pane setup stepper definition. */
export const SETUP_STEPS: SetupStep[] = [
  { key: "company", label: "Your company", sub: "About your team", icon: "brain" },
  { key: "connect", label: "Connect sources", sub: "Slack, Notion & more", icon: "sources" },
  { key: "configure", label: "Configure", sub: "Scope the knowledge", icon: "settings" },
  { key: "build", label: "Build the brain", sub: "Extract decisions", icon: "sparkles" },
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
