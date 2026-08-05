import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AppIcon } from "@/components/shared";
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
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { BRAND } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export interface DashboardTopBarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  /** Active page title for the breadcrumb tail. */
  activeTitle: string;
  reviewCount: number;
  onOpenCommand: () => void;
}

const ICON_BUTTON =
  "grid size-[34px] place-items-center rounded-[9px] text-ink-3 transition-colors hover:bg-cream hover:text-ink";

/** Global dashboard top bar: collapse toggle, breadcrumb, and chrome actions. */
export function DashboardTopBar({
  collapsed,
  onToggleSidebar,
  activeTitle,
  reviewCount,
  onOpenCommand,
}: DashboardTopBarProps) {
  const navigate = useNavigate();
  const { workspace } = useAuth();
  const { mode, toggleMode } = useTheme();
  const hasNotifications = reviewCount > 0;
  const isDark = mode === "dark";

  return (
    <header className="sticky top-0 z-20 flex h-[60px] shrink-0 items-center gap-3.5 border-b border-line bg-ivory/85 pl-6 pr-6 backdrop-blur-md backdrop-saturate-150">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className={cn(ICON_BUTTON, "-ml-1.5")}
          >
            <AppIcon
              name="sidebar"
              size={18}
              className={cn("transition-transform", collapsed && "-scale-x-100")}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {collapsed ? "Expand sidebar" : "Collapse sidebar"}
        </TooltipContent>
      </Tooltip>

      <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-sm text-ink-3">
        <span>{workspace?.name ?? BRAND.name}</span>
        <AppIcon name="chevronRight" size={13} className="text-ink-4" />
        <span aria-current="page" className="font-semibold text-ink">
          {activeTitle}
        </span>
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenCommand}
          aria-keyshortcuts="Meta+K Control+K"
          className="flex h-[34px] items-center gap-2 rounded-[9px] border border-line-2 bg-paper py-0 pl-3 pr-2.5 text-sm font-medium text-ink-3 transition-colors hover:border-ink-4 hover:text-ink"
        >
          <AppIcon name="search" size={15} />
          Ask
          <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-line-2 bg-cream px-1.5 font-mono text-[11px] font-semibold text-ink-3">
            ⌘K
          </kbd>
        </button>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleMode}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDark}
              className={ICON_BUTTON}
            >
              <AppIcon name="theme" size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{isDark ? "Light mode" : "Dark mode"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => navigate(ROUTES.reviews)}
              aria-label={
                hasNotifications
                  ? `Notifications, ${reviewCount} awaiting review`
                  : "Notifications"
              }
              className={cn(ICON_BUTTON, "relative")}
            >
              <AppIcon name="bell" size={18} />
              {hasNotifications && (
                <span
                  aria-hidden
                  className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-ivory bg-brand"
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Help"
                  className={cn(ICON_BUTTON, "data-[state=open]:bg-cream data-[state=open]:text-ink")}
                >
                  <AppIcon name="help" size={18} />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Help</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" sideOffset={6} className="min-w-56">
            <DropdownMenuItem
              onSelect={() => toast.info("Documentation", { description: "The Brainite docs open in a new tab." })}
            >
              <AppIcon name="document" size={16} className="text-ink-4" />
              Documentation
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toast.info("Keyboard shortcuts", {
                  description: "Press ⌘K to ask your brain or jump to any page.",
                })
              }
            >
              <AppIcon name="command" size={16} className="text-ink-4" />
              Keyboard shortcuts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                window.open("mailto:support@brainite.com", "_blank", "noopener");
              }}
            >
              <AppIcon name="help" size={16} className="text-ink-4" />
              Contact support
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
