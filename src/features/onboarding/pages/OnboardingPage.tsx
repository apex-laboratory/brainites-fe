import { useAuth } from "@/app/providers/AuthProvider";
import {
  useCreateWorkspace,
  useOnboardingFlow,
  useOnboardingProgress,
} from "@/features/onboarding/hooks";
import { toTeamSize, toUseCase } from "@/features/onboarding/api";
import { StepWelcome } from "@/features/onboarding/components/StepWelcome";
import { StepCompany } from "@/features/onboarding/components/StepCompany";
import { StepConnect } from "@/features/onboarding/components/StepConnect";
import { StepConfigure } from "@/features/onboarding/components/StepConfigure";
import { StepLearning } from "@/features/onboarding/components/StepLearning";
import { StepReady } from "@/features/onboarding/components/StepReady";
import { StepIntegrate } from "@/features/onboarding/components/StepIntegrate";

/**
 * Onboarding orchestrator. Stays thin: composes the flow hooks and renders the
 * active step.
 *
 * Real backend interactions: the company step creates the workspace (swapping in
 * a workspace-scoped token → satisfies `RequireWorkspace`); connect/configure use
 * the real Sources API (via `StepConnect`/`StepConfigure`). Each transition also
 * records progress best-effort via `useOnboardingProgress`.
 */
export function OnboardingPage() {
  const { workspaceId, completeOnboarding } = useAuth();
  const { step, next, back, company, setCompany } = useOnboardingFlow();
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
          onBack={back}
          onNext={() => {
            saveProgress({ step: "configure" });
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
