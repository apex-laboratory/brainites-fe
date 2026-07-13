import { z } from "zod";

/**
 * Zod schemas for the workspace Settings + Members APIs. Responses are
 * camelCase; the two PATCH/POST request bodies are simple (single-word or
 * camelCase) fields the backend accepts as-is.
 *
 * Not covered here: the Usage tab (no backend endpoint yet) and API keys (no
 * settings surface in this UI) — both stay on their current sources.
 */

// ── roles ───────────────────────────────────────────────────────────────────
export const MemberRoleSchema = z.enum(["admin", "editor", "viewer"]).catch("viewer");
export type MemberRole = z.infer<typeof MemberRoleSchema>;

/** Backend roles are lowercase; the UI shows them title-cased. */
export const ROLE_LABEL: Record<MemberRole, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

// ── settings ────────────────────────────────────────────────────────────────
export const WorkspaceConfigSchema = z.object({
  name: z.string(),
  domain: z.string().nullable(),
  plan: z.string(),
  seatLimit: z.number(),
});
export type WorkspaceConfig = z.infer<typeof WorkspaceConfigSchema>;

/** `GET /settings` → workspace config + the per-workspace MCP endpoint. */
export const SettingsSchema = z.object({
  workspace: WorkspaceConfigSchema,
  brainEndpoint: z.string(),
});
export type Settings = z.infer<typeof SettingsSchema>;

/** `PATCH /settings` → the updated workspace fields. */
export const UpdateSettingsSchema = z.object({
  workspace: z.object({
    id: z.string(),
    name: z.string(),
    domain: z.string().nullable(),
  }),
});
export type UpdateSettings = z.infer<typeof UpdateSettingsSchema>;

// ── members ─────────────────────────────────────────────────────────────────
export const MemberSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  role: MemberRoleSchema,
  title: z.string().nullable(),
  avatarColor: z.string().nullable(),
  isCurrentUser: z.boolean(),
});
export type Member = z.infer<typeof MemberSchema>;

export const MemberListSchema = z.array(MemberSchema);

/** `POST /members/invite` → the created (pending) invite. */
export const InviteResultSchema = z.object({
  inviteId: z.string(),
  email: z.string(),
  role: MemberRoleSchema,
  status: z.literal("pending"),
});
export type InviteResult = z.infer<typeof InviteResultSchema>;
