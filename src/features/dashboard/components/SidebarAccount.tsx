import { useNavigate } from "react-router-dom";

import { AppIcon, NiceAvatar } from "@/components/shared";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

import { CURRENT_USER } from "../data/workspace";

export interface SidebarAccountProps {
  collapsed: boolean;
}

/** Sidebar account row — opens Settings. Uses the shared NiceAvatar. */
export function SidebarAccount({ collapsed }: SidebarAccountProps) {
  const navigate = useNavigate();

  const button = (
    <button
      type="button"
      onClick={() => navigate(ROUTES.settings)}
      aria-label={collapsed ? CURRENT_USER.name : undefined}
      className={cn(
        "flex items-center transition-colors",
        collapsed
          ? "mt-2 justify-center border-t border-line py-2"
          : "gap-2.5 rounded-[11px] p-2 text-left hover:bg-paper"
      )}
    >
      <NiceAvatar name={CURRENT_USER.name} size={32} />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold leading-tight tracking-[-0.01em] text-ink">
              {CURRENT_USER.name}
            </span>
            <span className="block truncate text-[11.5px] leading-tight text-ink-4">
              {CURRENT_USER.title}
            </span>
          </span>
          <AppIcon name="settings" size={16} className="shrink-0 text-ink-4" />
        </>
      )}
    </button>
  );

  if (!collapsed) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">{CURRENT_USER.name}</TooltipContent>
    </Tooltip>
  );
}
