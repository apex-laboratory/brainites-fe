import { useOutletContext } from "react-router-dom";

/** Shell handlers passed from `DashboardLayout` down to routed pages. */
export type DashboardOutletContext = {
  /** Open the brain chat (e.g. Overview hero + suggestions). */
  askBrain: () => void;
  /** Open the command palette. */
  openCommand: () => void;
};

/** Typed accessor for the dashboard outlet context. */
export function useDashboardOutlet(): DashboardOutletContext {
  return useOutletContext<DashboardOutletContext>();
}
