import { Outlet } from "react-router-dom";

/** Shell for the onboarding flow. Setup rail/stepper arrive in Phase 2. */
export function OnboardingLayout() {
  return (
    <main className="h-full w-full overflow-y-auto">
      <Outlet />
    </main>
  );
}
