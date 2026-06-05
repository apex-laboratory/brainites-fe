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
  WELCOME_CARDS,
  TEAM_SIZES,
  USE_CASES,
  TIME_RANGES,
  FIRST_EXAMPLES,
  FIRST_ANSWER,
} from "./data/onboarding-fixtures";
export type {
  OnboardingStep,
  CompanyForm,
  AnswerSource,
  SetupStep,
  SetupStepKey,
  WelcomeCard,
  UseCase,
  SourceConnectMeta,
  ConnectionStatus,
} from "./types";
