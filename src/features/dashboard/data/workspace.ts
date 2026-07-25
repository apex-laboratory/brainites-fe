import { BRAND } from "@/constants/brand";

/**
 * Fallback workspace chrome for the sidebar switcher. `name`/`url` come from the
 * live session (see `WorkspaceSwitcher`); `plan` and `memberCount` stay static
 * until a backend surfaces them.
 */
export const WORKSPACE = {
  name: BRAND.workspace,
  plan: "Pro workspace",
  url: BRAND.workspaceUrl,
  memberCount: 12,
} as const;

/** Brain usage meter values (static, from the prototype). */
export const BRAIN_USAGE = {
  percent: 68,
  used: "18.4k",
  limit: "27k",
  period: "this month",
} as const;
