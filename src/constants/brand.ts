/**
 * Brainite product/brand constants.
 *
 * Product identity only — nothing tenant-specific belongs here. The active
 * workspace's name, slug and brain endpoint are per-tenant and come from the
 * session (`useAuth().workspace`) or the settings payload.
 */
export const BRAND = {
  onboardingName: "brainite",
  /** User-facing product name. */
  name: "Brainite",
  tagline: "Your company brain.",
} as const;

/**
 * Brand logo assets live under `src/assets/brand/brainite-exports/` and are
 * imported directly by `AppLogo` (light/dark wordmark lockups + node mark).
 */
