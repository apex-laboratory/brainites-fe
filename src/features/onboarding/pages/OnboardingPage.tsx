import { AppLogo } from "@/components/shared/AppLogo";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/shared/AppIcon";
import { useAuth } from "@/app/providers/AuthProvider";

/** Phase 1 foundation stub. The full onboarding flow is built in Phase 2. */
export function OnboardingPage() {
  const { completeOnboarding, logout } = useAuth();

  return (
    <div className="grid min-h-full place-items-center p-6">
      <div className="w-full max-w-md text-center">
        <AppLogo size="lg" className="justify-center" />
        <h1 className="mt-6 text-2xl font-bold text-ink">
          Let&apos;s build Riverline&apos;s brain
        </h1>
        <p className="mt-3 text-sm text-ink-3">
          The welcome → company → connect → configure → build → first-question
          flow arrives in Phases 2–3.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" onClick={logout}>
            <AppIcon name="arrowLeft" />
            Back
          </Button>
          <Button onClick={completeOnboarding}>
            Open dashboard
            <AppIcon name="arrow" />
          </Button>
        </div>
      </div>
    </div>
  );
}
