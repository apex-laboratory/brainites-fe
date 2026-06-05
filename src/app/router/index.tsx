import { Navigate, Route, Routes } from "react-router-dom";

import { AuthLayout } from "@/app/layouts/AuthLayout";
import { OnboardingLayout } from "@/app/layouts/OnboardingLayout";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { AuthPage } from "@/features/auth/pages/AuthPage";
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage";
import { OverviewPage } from "@/features/dashboard/pages/OverviewPage";
import { DecisionsPage } from "@/features/decisions/pages/DecisionsPage";
import { ReviewsPage } from "@/features/reviews/pages/ReviewsPage";
import { SourcesPage } from "@/features/sources/pages/SourcesPage";
import { SkillsPage } from "@/features/skills/pages/SkillsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";

/** Application routes. URLs are real even though data is static. */
export function AppRouter() {
  return (
    <Routes>
      <Route index element={<Navigate to="/auth" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      <Route element={<OnboardingLayout />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="decisions" element={<DecisionsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="sources" element={<SourcesPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}
