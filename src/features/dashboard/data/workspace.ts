import { BRAND } from "@/constants/brand";

/**
 * Pre-session fallback for the sidebar switcher, used only until `/auth/me`
 * resolves. Everything the switcher shows once loaded is live: `name`/`slug`
 * from the session, `plan` from the overview payload, member count from
 * `GET /members` (see `WorkspaceSwitcher`).
 */
export const WORKSPACE = {
  name: BRAND.workspace,
  url: BRAND.workspaceUrl,
} as const;
