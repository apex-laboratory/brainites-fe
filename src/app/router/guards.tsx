import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { ROUTES } from "@/constants/routes";

/** Full-screen gate shown while the session is being rehydrated on load. */
function SessionLoading() {
  return (
    <div
      className="grid min-h-full w-full place-items-center bg-ivory"
      role="status"
      aria-label="Loading"
    >
      <div className="size-6 animate-spin rounded-full border-2 border-line border-t-brand-ink" />
    </div>
  );
}

/**
 * Gate for authenticated areas (onboarding + dashboard). While the session is
 * still resolving we hold on a loader to avoid flashing the auth screen; once
 * resolved, an unauthenticated user is bounced to `/auth` (remembering where
 * they were headed).
 */
export function RequireAuth({ children }: { children?: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <SessionLoading />;
  if (status === "unauthenticated") {
    return <Navigate to={ROUTES.auth} replace state={{ from: location }} />;
  }
  return children ? <>{children}</> : <Outlet />;
}

/**
 * Dashboard-only gate: an authenticated user without a workspace still needs to
 * finish onboarding, so send them there rather than into an empty dashboard.
 */
export function RequireWorkspace({ children }: { children?: ReactNode }) {
  const { status, workspaceId } = useAuth();

  if (status === "loading") return <SessionLoading />;
  if (status === "unauthenticated") return <Navigate to={ROUTES.auth} replace />;
  if (!workspaceId) return <Navigate to={ROUTES.onboarding} replace />;
  return children ? <>{children}</> : <Outlet />;
}

/**
 * Guard for the auth screen itself: an already-authenticated visitor is sent to
 * their natural home (dashboard if they have a workspace, else onboarding).
 */
export function RequireGuest({ children }: { children?: ReactNode }) {
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
  return children ? <>{children}</> : <Outlet />;
}
