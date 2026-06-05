import { useOutletContext } from "react-router-dom";

/** Shell handlers passed from `DashboardLayout` down to routed pages. */
export type DashboardOutletContext = {
  /**
   * Open the brain chat. Pass a question to seed it (Overview suggestions);
   * call with no argument to just open it (hero "Open brain").
   */
  askBrain: (question?: string) => void;
  /** Open the command palette. */
  openCommand: () => void;
};

/** Typed accessor for the dashboard outlet context. */
export function useDashboardOutlet(): DashboardOutletContext {
  return useOutletContext<DashboardOutletContext>();
}
