import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { AppIcon, NiceAvatar } from "@/components/shared";
import type { AuthRole } from "@/features/auth/api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const ROLE_LABEL: Record<AuthRole, string> = {
  viewer: "Viewer",
  editor: "Editor",
  admin: "Admin",
};

export interface SidebarAccountProps {
  collapsed: boolean;
}

/** Sidebar account row — opens Settings. Shows the signed-in user (from the
 * session), falling back to their email when they haven't set a name. */
export function SidebarAccount({ collapsed }: SidebarAccountProps) {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const name = user?.name?.trim() || user?.email || "Your account";
  const subtitle = role
    ? ROLE_LABEL[role]
    : user?.name
      ? user.email
      : "Member";

  const button = (
    <button
      type="button"
      onClick={() => navigate(ROUTES.settings)}
      aria-label={collapsed ? name : undefined}
      className={cn(
        "flex items-center transition-colors",
        collapsed
          ? "mt-2 justify-center border-t border-line py-2"
          : "gap-2.5 rounded-[11px] p-2 text-left hover:bg-paper"
      )}
    >
      <NiceAvatar name={name} size={32} />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold leading-tight tracking-[-0.01em] text-ink">
              {name}
            </span>
            <span className="block truncate text-[11.5px] leading-tight text-ink-4">
              {subtitle}
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
      <TooltipContent side="right">{name}</TooltipContent>
    </Tooltip>
  );
}
