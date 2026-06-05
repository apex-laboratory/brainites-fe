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
import { StepBuild } from "@/features/onboarding/components/StepBuild";
import { StepFirstQuestion } from "@/features/onboarding/components/StepFirstQuestion";

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
    case "build":
      return <StepBuild onComplete={next} />;
    case "first-question":
      return (
        <StepFirstQuestion
          companyName={company.company}
          onDone={completeOnboarding}
        />
      );
    default:
      return null;
  }
}
