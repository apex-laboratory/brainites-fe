import { createContext, useContext } from "react";

import type { BrainChatState } from "../hooks/useBrainChat";

/**
 * Shares the single brain-chat conversation across the dashboard. The state is
 * created once in `DashboardLayout` (via `useBrainChat`) and provided here so
 * the full-page `BrainChatPage` keeps its history while the user navigates
 * around the rest of the dashboard.
 */
const BrainChatContext = createContext<BrainChatState | null>(null);

export const BrainChatProvider = BrainChatContext.Provider;

/** Typed accessor for the shared brain-chat conversation. */
export function useBrainChatContext(): BrainChatState {
  const ctx = useContext(BrainChatContext);
  if (!ctx) {
    throw new Error("useBrainChatContext must be used within a BrainChatProvider");
  }
  return ctx;
}
