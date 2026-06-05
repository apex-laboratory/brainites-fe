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
 * Path to the shared Brainite logo asset. Drop the provided file here.
 * Until it exists, `AppLogo` renders a temporary text lockup.
 */
export const LOGO_ASSET_PATH = "/src/assets/brand/brainite-logo.png";
