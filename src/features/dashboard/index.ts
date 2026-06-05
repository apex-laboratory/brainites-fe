export { OverviewPage } from "./pages/OverviewPage";

export {
  DashboardSidebar,
  DashboardTopBar,
  ShellOverlays,
} from "./components";

export {
  useDashboardNav,
  useDashboardShell,
  useSidebarState,
} from "./hooks";

export { ACTIVITY } from "./data/activity";
export { RECENT_QUESTIONS } from "./data/recent-questions";
export {
  NAV_MAIN,
  NAV_KNOWLEDGE,
  PAGE_TITLE_BY_PATH,
  type NavItem,
} from "./data/navigation";
export { CURRENT_USER, WORKSPACE, BRAIN_USAGE } from "./data/workspace";

export type { ActivityItem, ActivityKind } from "./types";
