import { Outlet } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import {
  DashboardSidebar,
  DashboardTopBar,
  ShellOverlays,
} from "@/features/dashboard/components";
import {
  useDashboardNav,
  useDashboardShell,
  useSidebarState,
} from "@/features/dashboard/hooks";
import { REVIEWS } from "@/features/reviews";

/**
 * Dashboard shell (Phase 4): collapsible sidebar + sticky top bar wrapping the
 * routed page outlet. Global ⌘K / ⌘/ shortcuts and their overlays are owned by
 * `useDashboardShell`.
 */
export function DashboardLayout() {
  const { logout } = useAuth();
  const { collapsed, toggle } = useSidebarState();
  const { activeTitle } = useDashboardNav();
  const { commandPalette, brainChat } = useDashboardShell();

  const reviewCount = REVIEWS.length;

  return (
    <div className="flex h-full w-full">
      <DashboardSidebar
        collapsed={collapsed}
        reviewCount={reviewCount}
        onOpenCommand={commandPalette.open}
        onLogout={logout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar
          collapsed={collapsed}
          onToggleSidebar={toggle}
          activeTitle={activeTitle}
          reviewCount={reviewCount}
          onOpenCommand={commandPalette.open}
        />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet
            context={{
              askBrain: brainChat.open,
              openCommand: commandPalette.open,
            }}
          />
        </main>
      </div>

      <ShellOverlays commandPalette={commandPalette} brainChat={brainChat} />
    </div>
  );
}
