import { useCallback, useMemo, useState } from "react";

import { BRAND } from "@/constants/brand";
import type { CompanyForm, OnboardingStep } from "@/features/onboarding/types";

const STEP_ORDER: OnboardingStep[] = [
  "welcome",
  "company",
  "connect",
  "configure",
  "learning",
  "ready",
  "integrate",
];

const INITIAL_COMPANY: CompanyForm = {
  company: BRAND.workspace,
  size: "51–200",
  useCase: "support",
  range: "90 days",
};

/**
 * Drives onboarding step navigation and the company-setup form. Step order
 * is linear; welcome and first-question sit outside the four-step setup
 * stepper rendered by `OnboardingFrame`.
 */
export function useOnboardingFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const [company, setCompanyState] = useState<CompanyForm>(INITIAL_COMPANY);

  const next = useCallback(
    () => setStepIndex((i) => Math.min(STEP_ORDER.length - 1, i + 1)),
    []
  );
  const back = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), []);

  /** Jump straight to a step, skipping the ones between (used to resume an
   * in-flight sweep on load, which lands the user mid-wizard by definition). */
  const goTo = useCallback((step: OnboardingStep) => {
    const index = STEP_ORDER.indexOf(step);
    if (index !== -1) setStepIndex(index);
  }, []);

  const setCompany = useCallback(
    (patch: Partial<CompanyForm>) =>
      setCompanyState((c) => ({ ...c, ...patch })),
    []
  );

  return useMemo(
    () => ({ step: STEP_ORDER[stepIndex], next, back, goTo, company, setCompany }),
    [stepIndex, next, back, goTo, company, setCompany]
  );
}
