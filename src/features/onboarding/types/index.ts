import type { AppIconName } from "@/components/shared/AppIcon";

/** Full ordered onboarding flow (welcome and ready sit outside the four-step
 * setup stepper). */
export type OnboardingStep =
  | "welcome"
  | "company"
  | "connect"
  | "configure"
  | "learning"
  | "ready"
  | "integrate";

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
