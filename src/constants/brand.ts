/** Brainite product/brand constants. */
export const BRAND = {
  /** User-facing product name. */
  name: "Brainite",
  /** The workspace represented in static data. */
  workspace: "Riverline",
  workspaceUrl: "riverline.io",
  /** Brain endpoint shown in settings (static). */
  brainEndpoint: "https://riverline.brainite.com/mcp",
  tagline: "Your company brain.",
} as const;

/**
 * Brand logo assets live under `src/assets/brand/brainite-exports/` and are
 * imported directly by `AppLogo` (light/dark wordmark lockups + node mark).
 */
