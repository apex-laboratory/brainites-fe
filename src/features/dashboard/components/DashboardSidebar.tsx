import { AppIcon, SectionLabel } from "@/components/shared";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

import { NAV_KNOWLEDGE, NAV_MAIN } from "../data/navigation";
import { SidebarAccount } from "./SidebarAccount";
import { SidebarNavItem } from "./SidebarNavItem";
import { UsageMeter } from "./UsageMeter";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export interface DashboardSidebarProps {
  collapsed: boolean;
  reviewCount: number;
  onOpenCommand: () => void;
  onLogout: () => void;
}

/** Small keyboard hint chip (⌘K). */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-line-2 bg-cream px-1.5 font-mono text-[11px] font-semibold text-ink-3">
      {children}
    </kbd>
  );
}

/**
 * The dashboard sidebar: workspace switcher, command trigger, two nav groups,
 * the usage meter and the account row. Collapses to a 72px icon rail.
 */
export function DashboardSidebar({
  collapsed,
  reviewCount,
  onOpenCommand,
  onLogout,
}: DashboardSidebarProps) {
  const commandTrigger = (
    <button
      type="button"
      onClick={onOpenCommand}
      aria-label="Search or ask your brain"
      aria-keyshortcuts="Meta+K Control+K"
      className={cn(
        "flex items-center rounded-[10px] border border-line-2 bg-paper-2 text-ink-4 transition-colors hover:border-ink-4",
        collapsed
          ? "mx-auto size-11 justify-center rounded-[12px]"
          : "mt-3 h-[38px] gap-2.5 px-3"
      )}
    >
      <AppIcon name="search" size={16} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 text-left text-[13.5px] text-ink-3">
            Search or ask…
          </span>
          <Kbd>⌘K</Kbd>
        </>
      )}
    </button>
  );

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-r border-line bg-cream transition-[width] duration-300 ease-out",
        collapsed ? "w-[72px] px-3 py-3.5" : "w-[252px] px-3.5 py-3.5"
      )}
    >
      <WorkspaceSwitcher collapsed={collapsed} onLogout={onLogout} />

      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{commandTrigger}</TooltipTrigger>
          <TooltipContent side="right">Search or ask (⌘K)</TooltipContent>
        </Tooltip>
      ) : (
        commandTrigger
      )}

      {/* nav */}
      <nav className="mt-2 min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {collapsed ? (
          <div className="h-3.5" />
        ) : (
          <SectionLabel className="mt-[18px] px-2.5">Workspace</SectionLabel>
        )}
        <div className="flex flex-col gap-0.5">
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
        <div className="flex flex-col gap-0.5">
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
