/** Centralized route paths. Keep these in sync with the router. */
export const ROUTES = {
  auth: "/auth",
  /** OAuth SSO redirect target — a single provider-less page (the BE registers
   * exactly this as the redirect_uri). The provider is recalled from
   * sessionStorage, not the URL. */
  authCallback: "/auth/callback",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  chat: "/dashboard/chat",
  decisions: "/dashboard/decisions",
  reviews: "/dashboard/reviews",
  sources: "/dashboard/sources",
  /** Where the backend redirects the browser after a source OAuth callback.
   * Forwarded to `sources`, preserving `?connected=` / `?error=`. */
  sourcesCallback: "/settings/sources",
  skills: "/dashboard/skills",
  agents: "/dashboard/agents",
  agentNew: "/dashboard/agents/new",
  /** One agent's builder. A function, not a constant — the id is in the path. */
  agentDetail: (agentId: string) => `/dashboard/agents/${agentId}`,
  settings: "/dashboard/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
/** Static paths only — `agentDetail` is a builder, not a route constant. */
export type RoutePath = Extract<(typeof ROUTES)[RouteKey], string>;

/** localStorage key persisting the current static app flow stage.
 * Kept as `heph_flow` for parity with the prototype. */
export const FLOW_STORAGE_KEY = "heph_flow";

export type FlowStage = "auth" | "onboarding" | "dashboard";
