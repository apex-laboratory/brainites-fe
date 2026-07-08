import { Navigate, Route, Routes } from "react-router-dom";

import { AuthLayout } from "@/app/layouts/AuthLayout";
import { OnboardingLayout } from "@/app/layouts/OnboardingLayout";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { RequireAuth, RequireGuest } from "@/app/router/guards";
import { AuthPage } from "@/features/auth/pages/AuthPage";
import { OAuthCallbackPage } from "@/features/auth/pages/OAuthCallbackPage";
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage";
import { OverviewPage } from "@/features/dashboard/pages/OverviewPage";
import { BrainChatPage } from "@/features/brain-chat";
import { DecisionsPage } from "@/features/decisions/pages/DecisionsPage";
import { ReviewsPage } from "@/features/reviews/pages/ReviewsPage";
import { SourcesPage } from "@/features/sources/pages/SourcesPage";
import { SkillsPage } from "@/features/skills/pages/SkillsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";

/**
 * Application routes. Auth state gates the tree:
 *  - `/auth` is guest-only (authenticated users are bounced home).
 *  - `/auth/callback/:provider` is the OAuth redirect target (public).
 *  - `/onboarding` requires a session.
 *  - `/dashboard/*` requires a session. Tighten to `RequireWorkspace` once
 *    onboarding wires up `POST /workspaces` (see BE_AUTH_QUESTIONS.md).
 */
export function AppRouter() {
  return (
    <Routes>
      <Route index element={<Navigate to="/auth" replace />} />

      <Route element={<AuthLayout />}>
        <Route element={<RequireGuest />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>
        <Route path="/auth/callback/:provider" element={<OAuthCallbackPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<OnboardingLayout />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="chat" element={<BrainChatPage />} />
          <Route path="decisions" element={<DecisionsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="sources" element={<SourcesPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}
