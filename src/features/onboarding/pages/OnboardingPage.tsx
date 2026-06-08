import { useAuth } from "@/app/providers/AuthProvider";
import {
  useOnboardingChannels,
  useOnboardingFlow,
  useSourceConnections,
} from "@/features/onboarding/hooks";
import { StepWelcome } from "@/features/onboarding/components/StepWelcome";
import { StepCompany } from "@/features/onboarding/components/StepCompany";
import { StepConnect } from "@/features/onboarding/components/StepConnect";
import { StepConfigure } from "@/features/onboarding/components/StepConfigure";
import { StepLearning } from "@/features/onboarding/components/StepLearning";
import { StepReady } from "@/features/onboarding/components/StepReady";
import { StepIntegrate } from "@/features/onboarding/components/StepIntegrate";

/**
 * Onboarding orchestrator. Stays thin: composes the flow/connection/channel
 * hooks and renders the active step. All logic lives in the hooks and steps.
 */
export function OnboardingPage() {
  const { completeOnboarding } = useAuth();
  const { step, next, back, company, setCompany } = useOnboardingFlow();
  const connections = useSourceConnections();
  const channels = useOnboardingChannels();

  switch (step) {
    case "welcome":
      return <StepWelcome onNext={next} />;
    case "company":
      return (
        <StepCompany
          company={company}
          setCompany={setCompany}
          onBack={back}
          onNext={next}
        />
      );
    case "connect":
      return <StepConnect connections={connections} onBack={back} onNext={next} />;
    case "configure":
      return (
        <StepConfigure
          range={company.range}
          setRange={(range) => setCompany({ range })}
          connectedIds={connections.connectedIds}
          channels={channels}
          onBack={back}
          onNext={next}
        />
      );
    case "learning":
      return <StepLearning onComplete={next} />;
    case "ready":
      return <StepReady onNext={next} />;
    case "integrate":
      return <StepIntegrate onBack={back} onDone={completeOnboarding} />;
    default:
      return null;
  }
}
