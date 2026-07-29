import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { useConnectionLanding } from "@/features/sources/hooks";
import {
  useActiveSweep,
  useCreateWorkspace,
  useOnboardingFlow,
  useOnboardingProgress,
} from "@/features/onboarding/hooks";
import { toCompanyStep } from "@/features/onboarding/api";
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
  const { step, next, back, goTo, company, setCompany } = useOnboardingFlow();
  const createWorkspace = useCreateWorkspace();
  const saveProgress = useOnboardingProgress();

  // Return leg of a source OAuth started on the connect step. `returnTo` brings
  // the browser back to `/onboarding?connected=…` (or `?error=…`); the step
  // index is in-memory and reset by the full-page redirect, so restore the
  // connect step and let `useConnectionLanding` toast + invalidate + strip the
  // param. Presence is captured once at mount, before the param is stripped.
  const [searchParams] = useSearchParams();
  const returnedFromConnect = useRef(
    searchParams.has("connected") || searchParams.has("error"),
  );
  useConnectionLanding();

  useEffect(() => {
    if (!returnedFromConnect.current) return;
    returnedFromConnect.current = false;
    goTo("connect");
  }, [goTo]);

  // Resume an in-flight sweep. `GET /sweeps/active` is read on every load, so a
  // refresh (or a closed tab) during the build lands straight back on "Building
  // your brain…" instead of restarting the wizard — and no sweep id is ever
  // persisted client-side. Fires once: after that the user owns navigation.
  const { sweep: activeSweep } = useActiveSweep();
  const resumed = useRef(false);

  useEffect(() => {
    if (resumed.current || !activeSweep) return;
    resumed.current = true;
    goTo("learning");
  }, [activeSweep, goTo]);

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
      saveProgress(toCompanyStep(company));
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
