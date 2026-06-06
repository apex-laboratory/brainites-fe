import { useNavigate } from "react-router-dom";

import { AppIcon, AppLogo } from "@/components/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

import { WORKSPACE } from "../data/workspace";

export interface WorkspaceSwitcherProps {
  collapsed: boolean;
  onLogout: () => void;
}

/** Square workspace mark — the Brainite node logo on a light chip. */
function WorkspaceMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center overflow-hidden rounded-[9px] border border-line bg-paper-2",
        className
      )}
    >
      <AppLogo markOnly size="sm" />
    </span>
  );
}

/**
 * Sidebar workspace switcher. Expanded, it opens a dropdown with workspace
 * info and quick actions (settings, invite, log out). Collapsed, the mark
 * becomes a shortcut back to the Overview.
 */
export function WorkspaceSwitcher({ collapsed, onLogout }: WorkspaceSwitcherProps) {
  const navigate = useNavigate();

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => navigate(ROUTES.dashboard)}
            aria-label={`${WORKSPACE.name} — go to Overview`}
            className="mx-auto flex size-11 items-center justify-center rounded-[11px] transition-colors hover:bg-paper"
          >
            <WorkspaceMark />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{WORKSPACE.name}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex w-full items-center gap-2.5 rounded-[11px] p-2 text-left transition-colors hover:bg-paper data-[state=open]:bg-paper"
        >
          <WorkspaceMark />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold leading-tight tracking-[-0.02em] text-ink">
              {WORKSPACE.name}
            </span>
            <span className="block truncate text-[11px] leading-tight text-ink-4">
              {WORKSPACE.plan}
            </span>
          </span>
          <AppIcon
            name="chevronDown"
            size={15}
            className="shrink-0 text-ink-4 transition-transform group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={6} className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-60">
        <div className="flex items-center gap-2.5 px-2 pb-2.5 pt-1.5">
          <WorkspaceMark />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-ink">{WORKSPACE.name}</div>
            <div className="truncate text-xs text-ink-3">
              {WORKSPACE.url} · {WORKSPACE.memberCount} members
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate(ROUTES.settings)}>
          <AppIcon name="settings" size={16} className="text-ink-4" />
          Workspace settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => navigate(ROUTES.settings, { state: { tab: "members" } })}
        >
          <AppIcon name="plus" size={16} className="text-ink-4" />
          Invite team
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onLogout}
          className="font-semibold text-brand-ink focus:text-brand-ink"
        >
          <AppIcon name="logout" size={16} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
