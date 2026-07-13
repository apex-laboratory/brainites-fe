import { useAuth } from "@/app/providers/AuthProvider";
import {
  useCreateWorkspace,
  useOnboardingChannels,
  useOnboardingFlow,
  useOnboardingProgress,
  useSourceConnections,
} from "@/features/onboarding/hooks";
import { toTeamSize, toTimeRange, toUseCase } from "@/features/onboarding/api";
import { StepWelcome } from "@/features/onboarding/components/StepWelcome";
import { StepCompany } from "@/features/onboarding/components/StepCompany";
import { StepConnect } from "@/features/onboarding/components/StepConnect";
import { StepConfigure } from "@/features/onboarding/components/StepConfigure";
import { StepLearning } from "@/features/onboarding/components/StepLearning";
import { StepReady } from "@/features/onboarding/components/StepReady";
import { StepIntegrate } from "@/features/onboarding/components/StepIntegrate";

/**
 * Onboarding orchestrator. Stays thin: composes the flow/connection/channel
 * hooks and renders the active step.
 *
 * The one real backend interaction here is workspace creation on the company
 * step — it swaps in a workspace-scoped token and satisfies `RequireWorkspace`.
 * Source connection itself is deferred to the Sources page (connect-later), so
 * the connect/configure/learning steps remain a guided preview; each transition
 * records progress best-effort via `useOnboardingProgress`.
 */
export function OnboardingPage() {
  const { workspaceId, completeOnboarding } = useAuth();
  const { step, next, back, company, setCompany } = useOnboardingFlow();
  const connections = useSourceConnections();
  const channels = useOnboardingChannels();
  const createWorkspace = useCreateWorkspace();
  const saveProgress = useOnboardingProgress();

  // Company → create the workspace (once), then advance. If a workspace already
  // exists (e.g. the user stepped back then forward), just re-record and move on.
  const handleCompanyNext = async () => {
    if (!workspaceId) {
      try {
        await createWorkspace.mutateAsync(company);
      } catch {
        return; // mutation surfaces the error toast; stay on the step
      }
    } else {
      saveProgress({
        step: "company",
        companyName: company.company.trim(),
        teamSize: toTeamSize(company.size),
        primaryUseCase: toUseCase(company.useCase),
      });
    }
    next();
  };

  switch (step) {
    case "welcome":
      return <StepWelcome onNext={next} />;
    case "company":
      return (
        <StepCompany
          company={company}
          setCompany={setCompany}
          onBack={back}
          onNext={handleCompanyNext}
          submitting={createWorkspace.isPending}
        />
      );
    case "connect":
      return (
        <StepConnect
          connections={connections}
          onBack={back}
          onNext={() => {
            saveProgress({ step: "connect" });
            next();
          }}
        />
      );
    case "configure":
      return (
        <StepConfigure
          range={company.range}
          setRange={(range) => setCompany({ range })}
          connectedIds={connections.connectedIds}
          channels={channels}
          onBack={back}
          onNext={() => {
            saveProgress({ step: "configure", timeRange: toTimeRange(company.range) });
            next();
          }}
        />
      );
    case "learning":
      return (
        <StepLearning
          onComplete={() => {
            saveProgress({ step: "build" });
            next();
          }}
        />
      );
    case "ready":
      return <StepReady onNext={next} />;
    case "integrate":
      return (
        <StepIntegrate
          onBack={back}
          onDone={() => {
            saveProgress({ step: "done" });
            completeOnboarding();
          }}
        />
      );
    default:
      return null;
  }
}
