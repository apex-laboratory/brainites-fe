import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AuthLayout } from "@/app/layouts/AuthLayout";
import { OnboardingLayout } from "@/app/layouts/OnboardingLayout";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { RequireAuth, RequireGuest, RequireWorkspace } from "@/app/router/guards";
import { ROUTES } from "@/constants/routes";
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
 * The backend finishes a source OAuth exchange server-side, then redirects the
 * browser to `/settings/sources?connected={provider}` — a path this app doesn't
 * serve. Forward it to the real Sources page, query string intact.
 */
function SourcesCallbackRedirect() {
  const { search } = useLocation();
  return <Navigate to={`${ROUTES.sources}${search}`} replace />;
}

/**
 * Application routes. Auth state gates the tree:
 *  - `/auth` is guest-only (authenticated users are bounced home).
 *  - `/auth/callback/:provider` is the OAuth redirect target (public).
 *  - `/onboarding` requires a session.
 *  - `/dashboard/*` requires a session **and** a workspace: every data endpoint
 *    is workspace-scoped, so `useWorkspaceId()` must never see a null id.
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

      <Route element={<RequireWorkspace />}>
        <Route path="/settings/sources" element={<SourcesCallbackRedirect />} />
      </Route>

      <Route element={<RequireWorkspace />}>
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
