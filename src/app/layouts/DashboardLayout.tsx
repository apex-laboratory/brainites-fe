import { Outlet } from "react-router-dom";

import { AppLogo } from "@/components/shared/AppLogo";

/**
 * Dashboard shell. The full sidebar + top bar are built in Phase 4; this
 * thin scaffold keeps the foundation routable in the meantime.
 */
export function DashboardLayout() {
  return (
    <div className="flex h-full w-full">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-cream p-4 md:flex">
        <AppLogo size="sm" />
        <p className="mt-6 text-xs text-ink-4">
          Sidebar navigation arrives in Phase 4.
        </p>
      </aside>
      <main className="h-full min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
