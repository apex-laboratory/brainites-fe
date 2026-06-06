export { OnboardingPage } from "./pages/OnboardingPage";
export {
  useOnboardingFlow,
  useSourceConnections,
  useOnboardingChannels,
} from "./hooks";
export {
  CHANNELS,
  DEFAULT_CHANNELS,
  SOURCE_CONNECT_META,
  SETUP_STEPS,
  LEARNING_STEPS,
  TEAM_SIZES,
  USE_CASES,
  TIME_RANGES,
} from "./data/onboarding-fixtures";
export type {
  OnboardingStep,
  CompanyForm,
  SetupStep,
  SetupStepKey,
  UseCase,
  SourceConnectMeta,
  ConnectionStatus,
} from "./types";
