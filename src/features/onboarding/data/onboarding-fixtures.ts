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

/** The one use case that opens a free-text box instead of standing on its own. */
export const OTHER_USE_CASE = "other";

/**
 * Company setup: what the team wants Brainite for. Multi-select — the ids match
 * the backend's `useCases` literals exactly, so no display→wire mapping exists
 * for them beyond a defensive parse.
 */
export const USE_CASES: UseCase[] = [
  { id: "support", t: "Customer Support", d: "Refunds, disputes, escalations", icon: "review" },
  { id: "ops", t: "Operations", d: "Runbooks, incidents, approvals", icon: "bolt" },
  { id: "eng", t: "Engineering", d: "Onboarding, code review, on-call", icon: "skills" },
  { id: "agents", t: "Internal Agents", d: "Tools that act on your behalf", icon: "sparkles" },
  { id: "sales", t: "Sales & Revenue", d: "Pricing, objections, renewals", icon: "arrowUp" },
  { id: "product", t: "Product & Design", d: "Specs, roadmap, past decisions", icon: "decision" },
  { id: "people", t: "HR & People Ops", d: "Policies, benefits, new hires", icon: "bookmark" },
  { id: "finance", t: "Finance & Legal", d: "Contracts, approvals, spend rules", icon: "document" },
  { id: "data", t: "Data & Analytics", d: "Metric definitions, dashboards", icon: "database" },
  { id: "marketing", t: "Marketing", d: "Positioning, launches, brand voice", icon: "pin" },
  { id: OTHER_USE_CASE, t: "Something else", d: "Tell us what you have in mind", icon: "plus" },
];
