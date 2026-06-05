import { useEffect } from "react";

import { useDisclosure, type Disclosure } from "@/hooks/useDisclosure";

export type DashboardShell = {
  /** Command palette open state (⌘K). Wired here, rendered in Phase 6. */
  commandPalette: Disclosure;
  /** Brain chat open state (⌘/). Wired here, rendered in Phase 6. */
  brainChat: Disclosure;
};

/**
 * Owns the shell-level overlays (command palette + brain chat) and the global
 * keyboard shortcuts that toggle them. The keydown listener is a genuine side
 * effect (an external subscription), so a single `useEffect` is appropriate.
 *
 *  - ⌘K / Ctrl-K → toggle the command palette
 *  - ⌘/ / Ctrl-/ → toggle the brain chat
 *  - Escape      → close the command palette
 */
export function useDashboardShell(): DashboardShell {
  const commandPalette = useDisclosure();
  const brainChat = useDisclosure();

  const toggleCommand = commandPalette.toggle;
  const closeCommand = commandPalette.close;
  const toggleChat = brainChat.toggle;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleCommand();
      } else if (mod && event.key === "/") {
        event.preventDefault();
        toggleChat();
      } else if (event.key === "Escape") {
        closeCommand();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleCommand, toggleChat, closeCommand]);

  return { commandPalette, brainChat };
}
