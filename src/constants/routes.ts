/** Centralized route paths. Keep these in sync with the router. */
export const ROUTES = {
  auth: "/auth",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  chat: "/dashboard/chat",
  decisions: "/dashboard/decisions",
  reviews: "/dashboard/reviews",
  sources: "/dashboard/sources",
  skills: "/dashboard/skills",
  settings: "/dashboard/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

/** localStorage key persisting the current static app flow stage.
 * Kept as `heph_flow` for parity with the prototype. */
export const FLOW_STORAGE_KEY = "heph_flow";

export type FlowStage = "auth" | "onboarding" | "dashboard";
