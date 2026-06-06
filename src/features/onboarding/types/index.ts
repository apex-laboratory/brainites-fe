import type { AppIconName } from "@/components/shared/AppIcon";

/** Full ordered onboarding flow (welcome and ready sit outside the four-step
 * setup stepper). */
export type OnboardingStep =
  | "welcome"
  | "company"
  | "connect"
  | "configure"
  | "learning"
  | "ready";

/** Company-setup form values, carried across the flow. */
export type CompanyForm = {
  company: string;
  size: string;
  useCase: string;
  range: string;
};

export type SetupStepKey = "company" | "connect" | "configure" | "build";

export type SetupStep = {
  key: SetupStepKey;
  label: string;
  sub: string;
  icon: AppIconName;
};

export type UseCase = {
  id: string;
  t: string;
  d: string;
  icon: AppIconName;
};

/** Per-source metadata shown on the connect/configure steps. */
export type SourceConnectMeta = {
  tag: string;
  /** Item count (pre-formatted, e.g. "3,412"). */
  count: string;
  unit: string;
  /** Example items the brain would read. */
  reads: string[];
  /** Count of additional unlisted items. */
  extra: number;
  /** Estimated decisions extractable from this source. */
  est: number;
};

export type ConnectionStatus = "idle" | "connecting" | "connected";
