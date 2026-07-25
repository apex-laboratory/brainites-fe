import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { Spinner } from "@/components/shared";
import { ROUTES } from "@/constants/routes";

/** Full-screen gate shown while the session is being rehydrated on load. */
function SessionLoading() {
  return (
    <div className="grid min-h-full w-full place-items-center bg-ivory">
      <Spinner label="Loading" />
    </div>
  );
}

/**
 * Gate for authenticated areas (onboarding + dashboard). While the session is
 * still resolving we hold on a loader to avoid flashing the auth screen; once
 * resolved, an unauthenticated user is bounced to `/auth` (remembering where
 * they were headed).
 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <SessionLoading />;
  if (status === "unauthenticated") {
    return <Navigate to={ROUTES.auth} replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/**
 * Dashboard-only gate: an authenticated user without a workspace still needs to
 * finish onboarding, so send them there rather than into an empty dashboard.
 */
export function RequireWorkspace() {
  const { status, workspaceId } = useAuth();

  if (status === "loading") return <SessionLoading />;
  if (status === "unauthenticated") return <Navigate to={ROUTES.auth} replace />;
  if (!workspaceId) return <Navigate to={ROUTES.onboarding} replace />;
  return <Outlet />;
}

/**
 * Guard for the auth screen itself: an already-authenticated visitor is sent to
 * their natural home (dashboard if they have a workspace, else onboarding).
 */
export function RequireGuest() {
  const { status, workspaceId } = useAuth();

  if (status === "loading") return <SessionLoading />;
  if (status === "authenticated") {
    return (
      <Navigate
        to={workspaceId ? ROUTES.dashboard : ROUTES.onboarding}
        replace
      />
    );
  }
  return <Outlet />;
}
