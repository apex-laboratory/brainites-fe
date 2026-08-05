import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
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
import { BRAND } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { useMembers } from "@/features/settings";
import { cn } from "@/utils/cn";

import { useOverview } from "../hooks/useOverview";

/**
 * The `slug · N members` line. Lives in its own component because radix
 * unmounts closed dropdown content — so the roster is only fetched when someone
 * actually opens the switcher, not on every dashboard page load.
 */
function WorkspaceMeta({ url }: { url: string }) {
  const { members, isPending } = useMembers();
  const showMembers = !isPending && members.length > 0;
  return (
    <div className="truncate text-xs text-ink-3">
      {url}
      {/* separator only when both halves are present */}
      {url && showMembers && " · "}
      {showMembers && (
        <>{members.length} member{members.length === 1 ? "" : "s"}</>
      )}
    </div>
  );
}

export interface WorkspaceSwitcherProps {
  collapsed: boolean;
  onLogout: () => void;
}

/**
 * The Brainite node mark, rendered flush on whatever surface it sits on.
 *
 * It used to sit on a `bg-paper-2` chip — but `--paper-2` is pure white, so on
 * the cream sidebar the transparent PNG read as a white sticker pasted behind
 * the logo. The asset already carries its own padding; it needs no plate. The
 * variant follows the theme because the default mark's nodes are near-black.
 */
function WorkspaceMark({ className }: { className?: string }) {
  const { mode } = useTheme();
  return (
    <AppLogo
      markOnly
      size="sm"
      onDark={mode === "dark"}
      className={cn("shrink-0", className)}
    />
  );
}

/**
 * Sidebar workspace switcher. Expanded, it opens a dropdown with workspace
 * info and quick actions (settings, invite, log out). Collapsed, the mark
 * becomes a shortcut back to the Overview.
 */
export function WorkspaceSwitcher({ collapsed, onLogout }: WorkspaceSwitcherProps) {
  const navigate = useNavigate();
  const { workspace } = useAuth();

  // Name + url come from the live session; the plan tier rides on the overview
  // payload (shared react-query cache, so this doesn't add a request on the
  // page that already fetched it).
  const { workspacePlan } = useOverview();
  // Pre-session fallback is the product name; the slug simply stays blank
  // until `/auth/me` resolves rather than showing a placeholder domain.
  const name = workspace?.name ?? BRAND.name;
  const url = workspace?.slug ?? "";

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => navigate(ROUTES.dashboard)}
            aria-label={`${name} — go to Overview`}
            className="mx-auto flex size-11 items-center justify-center rounded-[11px] transition-colors hover:bg-paper"
          >
            <WorkspaceMark />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{name}</TooltipContent>
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
              {name}
            </span>
            <span className="block truncate text-[11px] leading-tight text-ink-4">
              {workspacePlan ? `${workspacePlan} workspace` : ""}
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
            <div className="truncate text-sm font-bold text-ink">{name}</div>
            <WorkspaceMeta url={url} />
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
