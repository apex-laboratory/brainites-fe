import { useEffect } from "react";

export type DashboardShortcutHandlers = {
  /** ⌘K / Ctrl-K — toggle the command palette. */
  toggleCommand: () => void;
  /** ⌘/ / Ctrl-/ — toggle the brain chat. */
  toggleChat: () => void;
  /** Escape — close the command palette. */
  closeCommand: () => void;
};

/**
 * Wires the global dashboard keyboard shortcuts. The keydown listener is a
 * genuine external subscription, so a single `useEffect` is appropriate.
 */
export function useDashboardShortcuts({
  toggleCommand,
  toggleChat,
  closeCommand,
}: DashboardShortcutHandlers) {
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
}
