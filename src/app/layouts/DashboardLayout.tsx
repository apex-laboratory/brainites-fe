import { Outlet } from "react-router-dom";

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
import { BrainChat } from "@/features/brain-chat/components";
import { useBrainChat } from "@/features/brain-chat/hooks";
import { useDisclosure } from "@/hooks/useDisclosure";
import { REVIEWS } from "@/features/reviews";

/**
 * Dashboard shell: collapsible sidebar + sticky top bar wrapping the routed
 * page outlet, plus the global command palette and brain chat. ⌘K / ⌘/ are
 * wired through `useDashboardShortcuts`.
 */
export function DashboardLayout() {
  const { logout } = useAuth();
  const { collapsed, toggle } = useSidebarState();
  const { activeTitle } = useDashboardNav();

  const commandPalette = useDisclosure();
  const chat = useBrainChat();

  useDashboardShortcuts({
    toggleCommand: commandPalette.toggle,
    toggleChat: chat.toggle,
    closeCommand: commandPalette.close,
  });

  const reviewCount = REVIEWS.length;

  return (
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
              askBrain: (question?: string) =>
                question ? chat.ask(question) : chat.open(),
              openCommand: commandPalette.open,
            }}
          />
        </main>
      </div>

      <CommandPalette
        open={commandPalette.isOpen}
        onOpenChange={commandPalette.setOpen}
        onAsk={chat.ask}
      />
      <BrainChat
        isOpen={chat.isOpen}
        open={chat.open}
        close={chat.close}
        send={chat.send}
        messages={chat.messages}
        typing={chat.typing}
        suggestions={chat.suggestions}
        showSuggestions={chat.showSuggestions}
      />
    </div>
  );
}
