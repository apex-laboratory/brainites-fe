import type { AppIconName } from "@/components/shared/AppIcon";
import type { SourceId } from "@/types/common";

/** Full ordered onboarding flow (welcome and first-question sit outside the
 * four-step setup stepper). */
export type OnboardingStep =
  | "welcome"
  | "company"
  | "connect"
  | "configure"
  | "build"
  | "first-question";

/** Company-setup form values, carried across the flow. */
export type CompanyForm = {
  company: string;
  size: string;
  useCase: string;
  range: string;
};

/** A source reference shown under the first-question answer. */
export type AnswerSource = {
  id: SourceId;
  label: string;
};

export type SetupStepKey = "company" | "connect" | "configure" | "build";

export type SetupStep = {
  key: SetupStepKey;
  label: string;
  sub: string;
  icon: AppIconName;
};

export type WelcomeCard = {
  icon: AppIconName;
  t: string;
  d: string;
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
