import type { AppIconName } from "@/components/shared/AppIcon";
import { ROUTES } from "@/constants/routes";

export type NavItem = {
  /** Stable identifier (also used as the breadcrumb/page key). */
  key: string;
  label: string;
  /** Named UI icon resolved through `AppIcon`. */
  icon: AppIconName;
  /** Target route path. */
  path: string;
  /** Match the path exactly (used for the index/Overview route). */
  end?: boolean;
};

/** Primary workspace navigation (Overview · Ask brain · Decisions · Reviews). */
export const NAV_MAIN: NavItem[] = [
  { key: "overview", label: "Overview", icon: "grid", path: ROUTES.dashboard, end: true },
  { key: "chat", label: "Ask brain", icon: "brain", path: ROUTES.chat },
  { key: "decisions", label: "Decisions", icon: "decision", path: ROUTES.decisions },
  { key: "reviews", label: "Reviews", icon: "review", path: ROUTES.reviews },
];

/** Knowledge navigation group (Sources · Skills). */
export const NAV_KNOWLEDGE: NavItem[] = [
  { key: "sources", label: "Sources", icon: "sources", path: ROUTES.sources },
  { key: "skills", label: "Skills", icon: "skills", path: ROUTES.skills },
];

/** Settings is reachable from the chrome (workspace menu / account) but is
 * not a primary nav row — kept here so the breadcrumb can title it. */
const SETTINGS_TITLE: NavItem = {
  key: "settings",
  label: "Settings",
  icon: "settings",
  path: ROUTES.settings,
};

/** Breadcrumb/page title lookup by exact route path. */
export const PAGE_TITLE_BY_PATH: Record<string, string> = Object.fromEntries(
  [...NAV_MAIN, ...NAV_KNOWLEDGE, SETTINGS_TITLE].map((n) => [n.path, n.label])
);
