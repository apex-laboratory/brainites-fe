import { useLocation } from "react-router-dom";

import {
  NAV_KNOWLEDGE,
  NAV_MAIN,
  PAGE_TITLE_BY_PATH,
  type NavItem,
} from "../data/navigation";

export type DashboardNav = {
  main: NavItem[];
  knowledge: NavItem[];
  /** Title of the active route, for the top-bar breadcrumb. */
  activeTitle: string;
};

/**
 * Exposes the dashboard navigation groups plus the title of the active route
 * (derived from the URL, never synced via an effect).
 */
export function useDashboardNav(): DashboardNav {
  const { pathname } = useLocation();
  const activeTitle = PAGE_TITLE_BY_PATH[pathname] ?? "Overview";

  return { main: NAV_MAIN, knowledge: NAV_KNOWLEDGE, activeTitle };
}
