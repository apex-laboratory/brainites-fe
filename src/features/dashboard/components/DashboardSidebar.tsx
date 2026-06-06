import { SectionLabel } from "@/components/shared";
import { cn } from "@/utils/cn";

import { NAV_KNOWLEDGE, NAV_MAIN } from "../data/navigation";
import { SidebarAccount } from "./SidebarAccount";
import { SidebarNavItem } from "./SidebarNavItem";
import { UsageMeter } from "./UsageMeter";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export interface DashboardSidebarProps {
  collapsed: boolean;
  reviewCount: number;
  onLogout: () => void;
}

/**
 * The dashboard sidebar: workspace switcher, two nav groups, the usage meter
 * and the account row. Collapses to a 72px icon rail.
 */
export function DashboardSidebar({
  collapsed,
  reviewCount,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-r border-line bg-cream transition-[width] duration-300 ease-out",
        collapsed ? "w-[72px] px-3 py-3.5" : "w-[252px] px-3.5 py-3.5"
      )}
    >
      <WorkspaceSwitcher collapsed={collapsed} onLogout={onLogout} />

      {/* nav */}
      <nav className="mt-2 min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {collapsed ? (
          <div className="h-3.5" />
        ) : (
          <SectionLabel className="mt-[18px] px-2.5">Workspace</SectionLabel>
        )}
        <div className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
          {NAV_MAIN.map((item) => (
            <SidebarNavItem
              key={item.key}
              item={item}
              collapsed={collapsed}
              badge={item.key === "reviews" ? reviewCount : undefined}
            />
          ))}
        </div>

        {collapsed ? (
          <div className="mx-auto my-2.5 h-px w-8 bg-line" />
        ) : (
          <SectionLabel className="mt-[18px] px-2.5">Knowledge</SectionLabel>
        )}
        <div className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
          {NAV_KNOWLEDGE.map((item) => (
            <SidebarNavItem key={item.key} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {!collapsed && <UsageMeter />}

      <SidebarAccount collapsed={collapsed} />
    </aside>
  );
}
