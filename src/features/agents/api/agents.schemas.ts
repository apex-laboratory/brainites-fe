import { z } from "zod";

// Imported from the module, not the `@/lib/api` barrel: this file must stay a
// pure schema module, free of the client's `import.meta.env` side effects.
import { IsoDateTimeSchema } from "@/lib/api/schemas";

/**
 * Zod schemas for the Agent Builder API (`/api/v1/agents`), per
 * `docs/agent-builder-plan.md` §5.3 and the generated `docs/openapi.json`.
 *
 * Two things differ from the Sources slice next door, and both are deliberate:
 *
 *  - **Request bodies here are camelCase.** Sources' bodies are snake_case;
 *    this module's backend schemas use `CamelRequestModel`, which takes
 *    camelCase and rejects unknown keys. Do not "fix" these to snake_case to
 *    match Sources — an unknown key is a 422, so getting the case wrong fails
 *    loudly rather than silently dropping a field.
 *  - **Agents are user-owned, not just workspace-scoped.** Every response
 *    carries `ownerUserId` and a server-computed `isOwner`. Read ownership from
 *    `isOwner` rather than comparing ids in the client: the backend already
 *    knows, and a second implementation of the same rule is a second place for
 *    it to drift.
 *
 * Enums are `.catch()`-guarded where a new server value must not blank the
 * screen, and left strict where an unexpected value would mean we render
 * something untrue.
 */

/** Models the builder offers. Mirrors the backend's `AgentModel` literal. */
export const AgentModelSchema = z.enum(["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"]);
export type AgentModel = z.infer<typeof AgentModelSchema>;

/** Reasoning effort. Agent-level only — a per-session override is ignored by
 * Anthropic, so this is the one place it can be set. */
export const AgentEffortSchema = z.enum(["low", "medium", "high", "xhigh", "max"]);
export type AgentEffort = z.infer<typeof AgentEffortSchema>;

export const VisibilitySchema = z.enum(["private", "workspace"]);
export type Visibility = z.infer<typeof VisibilitySchema>;

export const AgentStatusSchema = z.enum(["draft", "active", "archived"]);
export type AgentStatus = z.infer<typeof AgentStatusSchema>;

/** Display metadata for the model select. Kept beside the schema so adding a
 * model is one edit, not two. */
export const MODEL_LABELS: Record<AgentModel, { label: string; hint: string }> = {
  "claude-opus-5": { label: "Opus 5", hint: "Most capable. The default." },
  "claude-sonnet-5": { label: "Sonnet 5", hint: "Faster and cheaper for routine work." },
  "claude-haiku-4-5": { label: "Haiku 4.5", hint: "Fastest. Best for simple, high-volume tasks." },
};

export const EFFORT_LABELS: Record<AgentEffort, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "Very high",
  max: "Max",
};

/**
 * One agent.
 *
 * `version` is the Anthropic agent version, and it is what a save sends back
 * for optimistic concurrency. It is `null` for a draft that has never synced.
 */
export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().default(null),
  systemPrompt: z.string().nullable().default(null),
  model: z.string().nullable().default(null),
  effort: z.string().nullable().default(null),
  groundInBrain: z.boolean().default(true),
  budgetCents: z.number().nullable().default(null),
  visibility: VisibilitySchema.catch("private"),
  status: AgentStatusSchema.catch("draft"),
  ownerUserId: z.string(),
  isOwner: z.boolean().default(false),
  version: z.number().nullable().default(null),
  createdAt: IsoDateTimeSchema.nullable().default(null),
  updatedAt: IsoDateTimeSchema.nullable().default(null),
});
export type Agent = z.infer<typeof AgentSchema>;

export const AgentListSchema = z.array(AgentSchema);

/** One entry of the agent's append-only history, proxied from Anthropic. */
export const AgentVersionSchema = z.object({
  version: z.number().nullable().default(null),
  name: z.string().nullable().default(null),
  createdAt: IsoDateTimeSchema.nullable().default(null),
});
export type AgentVersion = z.infer<typeof AgentVersionSchema>;

export const AgentVersionListSchema = z.array(AgentVersionSchema);

/**
 * One MCP server this agent talks to.
 *
 * Deliberately carries no credential material — the backend stores none, and
 * the tokens live in an Anthropic vault. If a field that looks like a secret
 * ever appears here, that is a backend bug, not something to render.
 */
export const AgentConnectorSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  name: z.string(),
  mcpServerUrl: z.string(),
  provider: z.string().nullable().default(null),
  toolAllowlist: z.array(z.string()).default([]),
  createdAt: IsoDateTimeSchema.nullable().default(null),
});
export type AgentConnector = z.infer<typeof AgentConnectorSchema>;

export const AgentConnectorListSchema = z.array(AgentConnectorSchema);

/**
 * Whether the calling user has authorized this connector.
 *
 * **Nothing sets this to anything but `available` yet.** The real value comes
 * from `GET /agent-credentials`, which is the backend's phase 2. It exists now
 * so the picker renders through a status it already understands: when that
 * endpoint lands, one hook fills this in and no component changes shape. The
 * alternative — assuming everything is connected — bakes that assumption into
 * the render path and makes the "Connect" affordance a retrofit.
 */
export const ConnectionStatusSchema = z.enum(["available", "connected", "needs-auth"]);
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;

/** Backend rule: `^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$`. This is not cosmetic — the
 * name is the key Anthropic's `mcp_toolset.mcp_server_name` resolves against. */
export const ConnectorNameSchema = z
  .string()
  .trim()
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/,
    "Letters, numbers, dashes and underscores only — no spaces",
  );

/** Backend requires https. Anthropic connects carrying a vault credential, so a
 * plaintext hop would put that credential on the wire. */
export const McpServerUrlSchema = z
  .string()
  .trim()
  .url("Enter a full URL, e.g. https://mcp.example.com/mcp")
  .refine((url) => url.startsWith("https://"), "Must be an https:// URL");

/** Anthropic's per-agent cap (`MAX_CONNECTORS_PER_AGENT` server-side). */
export const MAX_CONNECTORS = 20;

/** Anthropic caps the system prompt at 100K characters. */
export const SYSTEM_PROMPT_MAX = 100_000;

export const AgentNameSchema = z.string().trim().min(1, "Give the agent a name").max(256);

/** `POST /agents` body. camelCase — see the module note. */
export interface AgentCreateBody {
  name: string;
  description?: string | null;
  systemPrompt?: string | null;
  model?: AgentModel;
  effort?: AgentEffort | null;
  groundInBrain?: boolean;
  budgetCents?: number | null;
}

/**
 * `PATCH /agents/{id}` body.
 *
 * Partial by design: the backend reads it with `exclude_unset`, so an omitted
 * key means "leave alone" and an explicit `null` means "clear". Build these
 * objects with only the keys you intend to change — spreading a whole form
 * state in will resend every field, which is harmless but mints an Anthropic
 * version for a save that changed nothing.
 */
export interface AgentUpdateBody extends Partial<AgentCreateBody> {
  status?: AgentStatus;
  /** Optimistic concurrency. Send the version you loaded to get a 409 when
   * someone else has edited since. */
  version?: number | null;
}

export interface AgentConnectorCreateBody {
  name: string;
  mcpServerUrl: string;
  provider?: string | null;
  toolAllowlist?: string[];
}
