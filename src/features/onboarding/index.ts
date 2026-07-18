export { OnboardingPage } from "./pages/OnboardingPage";
export {
  useOnboardingFlow,
  useCreateWorkspace,
  useOnboardingProgress,
} from "./hooks";
export {
  SETUP_STEPS,
  LEARNING_STEPS,
  TEAM_SIZES,
  USE_CASES,
} from "./data/onboarding-fixtures";
export type {
  OnboardingStep,
  CompanyForm,
  SetupStep,
  SetupStepKey,
  UseCase,
} from "./types";
