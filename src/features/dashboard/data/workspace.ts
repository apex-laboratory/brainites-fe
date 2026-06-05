import { BRAND } from "@/constants/brand";

/** The signed-in user shown in the sidebar account row (prototype: Dana Reyes). */
export const CURRENT_USER = {
  name: "Dana Reyes",
  title: "Head of CX · Admin",
} as const;

/** The active workspace shown in the sidebar switcher. */
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
