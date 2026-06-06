import { useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import {
  CommandPalette,
  DashboardSidebar,
  DashboardTopBar,
} from "@/features/dashboard/components";
import {
  useDashboardNav,
  useDashboardShortcuts,
  useSidebarState,
} from "@/features/dashboard/hooks";
import { BrainChatProvider, useBrainChat } from "@/features/brain-chat";
import { useDisclosure } from "@/hooks/useDisclosure";
import { REVIEWS } from "@/features/reviews";
import { ROUTES } from "@/constants/routes";

/**
 * Dashboard shell: collapsible sidebar + sticky top bar wrapping the routed
 * page outlet, plus the global command palette. The brain chat is now a
 * full-page tab (`/dashboard/chat`); its conversation is created here and
 * shared via `BrainChatProvider` so history persists across navigation. ⌘K
 * opens the command palette and ⌘/ jumps to the chat tab.
 */
export function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggle } = useSidebarState();
  const { activeTitle } = useDashboardNav();

  const commandPalette = useDisclosure();
  const chat = useBrainChat();

  /** Open the brain chat tab, optionally seeding it with a question. */
  const askBrain = useCallback(
    (question?: string) => {
      navigate(ROUTES.chat);
      if (question) chat.send(question);
    },
    [navigate, chat]
  );

  useDashboardShortcuts({
    toggleCommand: commandPalette.toggle,
    openChat: askBrain,
    closeCommand: commandPalette.close,
  });

  const reviewCount = REVIEWS.length;

  return (
    <BrainChatProvider value={chat}>
      <div className="flex h-full w-full">
        <DashboardSidebar
          collapsed={collapsed}
          reviewCount={reviewCount}
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
                askBrain,
                openCommand: commandPalette.open,
              }}
            />
          </main>
        </div>

        <CommandPalette
          open={commandPalette.isOpen}
          onOpenChange={commandPalette.setOpen}
          onAsk={askBrain}
        />
      </div>
    </BrainChatProvider>
  );
}
