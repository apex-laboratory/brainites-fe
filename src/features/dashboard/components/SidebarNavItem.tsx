import { NavLink } from "react-router-dom";

import { AppIcon } from "@/components/shared";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

import type { NavItem } from "../data/navigation";

export interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  /** Optional count badge (e.g. pending reviews). */
  badge?: number;
}

/**
 * A single sidebar nav row. Uses `NavLink` so the active state follows the
 * URL, with an orange left indicator. Collapsed rows shrink to an icon button
 * and surface their label via a tooltip for accessibility.
 */
export function SidebarNavItem({ item, collapsed, badge }: SidebarNavItemProps) {
  const showBadge = typeof badge === "number" && badge > 0;

  const link = (
    <NavLink
      to={item.path}
      end={item.end}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "relative flex items-center rounded-[9px] text-sm font-medium tracking-[-0.01em] text-ink-3 transition-colors hover:bg-paper hover:text-ink",
          collapsed ? "mx-auto h-11 w-11 justify-center" : "h-9 gap-[11px] px-2.5",
          isActive && "bg-paper-2 font-semibold text-ink shadow-soft-1"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden
              className={cn(
                "absolute top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r bg-brand",
                collapsed ? "-left-3" : "-left-3.5"
              )}
            />
          )}
          <AppIcon
            name={item.icon}
            size={18}
            className={cn("shrink-0", isActive && "text-brand")}
          />
          {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
          {!collapsed && showBadge && (
            <span className="tnum shrink-0 rounded-full bg-brand px-[7px] py-px text-[11px] font-bold text-white">
              {badge}
            </span>
          )}
          {collapsed && showBadge && (
            <span
              aria-hidden
              className="absolute right-2 top-2 size-[7px] rounded-full bg-brand"
            />
          )}
        </>
      )}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">
        {item.label}
        {showBadge ? ` · ${badge}` : ""}
      </TooltipContent>
    </Tooltip>
  );
}
