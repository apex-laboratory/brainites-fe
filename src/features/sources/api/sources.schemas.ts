import { z } from "zod";

// Imported from the module, not the `@/lib/api` barrel: this file must stay a
// pure schema module, free of the client's `import.meta.env` side effects.
import { IsoDateTimeSchema } from "@/lib/api/schemas";

/**
 * Zod schemas for the Sources API (`/api/v1/sources`), per INTEGRATIONS.md —
 * the shipped wire contract.
 *
 * Two asymmetries the backend documents and we live with here:
 *  - **Responses are camelCase, request bodies are snake_case** and reject
 *    unknown keys (`extra="forbid"`). Request builders below spell fields in
 *    snake_case deliberately; do not "fix" them to camelCase.
 *  - Sources are **not** workspace-scoped in the path. The workspace is taken
 *    from the JWT, so no `workspaceId` appears in these routes.
 */

/** Registered providers (`app/integrations/__init__.py`). These double as the
 * app's `SourceId`, so `SOURCES[source.provider]` resolves name/icon/color. */
export const SourceProviderSchema = z.enum([
  "slack",
  "notion",
  "github",
  "jira",
  "zendesk",
  "google_drive",
  "gmail",
]);
export type SourceProvider = z.infer<typeof SourceProviderSchema>;

/** Providers whose OAuth needs a tenant subdomain before we can build the
 * consent URL (the backend `422`s without it). */
export const SUBDOMAIN_PROVIDERS = ["zendesk"] as const satisfies readonly SourceProvider[];

export function needsSubdomain(provider: SourceProvider): boolean {
  return (SUBDOMAIN_PROVIDERS as readonly string[]).includes(provider);
}

/** Backend rule: `^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$`. */
export const SubdomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/, "Enter a valid subdomain, e.g. acme");

/**
 * `status` / `syncStatus` are presentational only — a dot color and a label. A
 * provider state we haven't seen must degrade to "unknown", never take the page
 * down, so these fall back instead of throwing. Fields we *compute* from
 * (health, counts, ids) stay strict so real drift is loud.
 */
export const SourceStatusSchema = z
  .enum(["connected", "disconnected", "error", "pending", "unknown"])
  .catch("unknown");
export type SourceStatus = z.infer<typeof SourceStatusSchema>;

export const SyncStatusSchema = z
  .enum(["healthy", "syncing", "pending", "error", "unknown"])
  .catch("unknown");
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

/**
 * A connected source. The trailing block is **not** returned by `GET /sources`
 * today — it lives on the dashboard `overview` payload. Declared optional so the
 * card renders those blocks when the backend starts sending them and quietly
 * omits them until it does.
 */
export const SourceSchema = z.object({
  id: z.string(),
  provider: SourceProviderSchema,
  name: z.string(),
  status: SourceStatusSchema,
  syncStatus: SyncStatusSchema,
  externalAccountId: z.string().nullable(),
  lastSyncedAt: IsoDateTimeSchema.nullable(),
  /** 0–100. `null` before the first sync. */
  health: z.number().min(0).max(100).nullable(),
  createdAt: IsoDateTimeSchema,

  /**
   * When this source's *history* was imported. Connecting a source ingests
   * nothing on its own, so `null` means its past has never been fetched and the
   * source only knows about events since it was connected. Distinct from
   * `lastSyncedAt`, which is the incremental cursor and moves on every sync.
   */
  backfilledAt: IsoDateTimeSchema.nullish(),
  /**
   * Backend-computed: history never imported *and* nothing importing it right
   * now. The single source of truth for whether to offer "Import history" — do
   * not re-derive it from `backfilledAt`, because the backend also accounts for
   * an in-flight import and for one that was queued but never picked up.
   *
   * `nullish` so this file can ship ahead of the backend; absent reads as
   * "don't offer it", which is the safe default.
   */
  needsBackfill: z.boolean().nullish(),

  /**
   * What this source has read and what became of it, across its whole lifetime —
   * not just the last import, since webhooks add events outside any sweep.
   * `skillsKept === 0 && itemsRead > 0` is the state that reads as broken, and is
   * exactly what the read report exists to explain.
   */
  itemsRead: z.number().nullish(),
  skillsKept: z.number().nullish(),
  discarded: z.number().nullish(),

  pendingItems: z.number().nullish(),
  activeChannelCount: z.number().nullish(),
  extractedLabel: z.string().nullish(),
  /** 7-day ingest series for the sparkline. */
  ingest7d: z.array(z.number()).nullish(),
});
export type Source = z.infer<typeof SourceSchema>;

/**
 * Row-level tolerant: a single unrecognized provider (a new backend integration
 * the FE doesn't know yet) must not fail the whole list and blank the Sources
 * surface. Unknown rows are dropped rather than coerced, because every consumer
 * indexes `SOURCES[provider]` and a sentinel provider would break the row anyway.
 */
export const SourceListSchema = z.array(z.unknown()).transform((rows) =>
  rows.reduce<Source[]>((kept, row) => {
    const parsed = SourceSchema.safeParse(row);
    if (parsed.success) kept.push(parsed.data);
    return kept;
  }, []),
);

/**
 * One reason-bucket in the read report. `label` is resolved backend-side from the
 * pipeline stage, so the UI never renders internal vocabulary like
 * "relevance_gate" — and a stage added to the pipeline later still gets a label
 * without a frontend deploy. `stage` is kept for keys and debugging only.
 *
 * `sampleReasons` are verbatim model sentences, capped at three: they're free-text
 * and near-unique (56 discarded events produced 56 distinct ones), so the count
 * carries the signal and the samples carry the texture.
 */
export const DiscardGroupSchema = z.object({
  stage: z.string(),
  label: z.string(),
  count: z.number(),
  sampleReasons: z.array(z.string()).default([]),
});
export type DiscardGroup = z.infer<typeof DiscardGroupSchema>;

/** `GET /sources/{id}/report` — what this source read, and why things dropped. */
export const SourceReportSchema = z.object({
  sourceId: z.string(),
  itemsRead: z.number(),
  skillsKept: z.number(),
  discarded: z.number(),
  pendingItems: z.number(),
  discardedByStage: z.array(DiscardGroupSchema).default([]),
});
export type SourceReport = z.infer<typeof SourceReportSchema>;

/** `POST /sources/{provider}/authorize` → the provider consent URL. */
export const AuthorizeSchema = z.object({
  authorizeUrl: z.string().url(),
});
export type Authorize = z.infer<typeof AuthorizeSchema>;

/**
 * A channel / page / repo / view the source can read from. `id` is `null` for a
 * channel the provider exposes but we've never persisted a selection for, so
 * `externalId` — not `id` — is the stable key.
 */
export const SourceChannelSchema = z.object({
  id: z.string().nullable(),
  externalId: z.string(),
  name: z.string(),
  selected: z.boolean(),
  itemCount: z.number(),
});
export type SourceChannel = z.infer<typeof SourceChannelSchema>;

export const SourceChannelListSchema = z.array(SourceChannelSchema);

/** Backend bounds for `lookback_days`. */
export const LOOKBACK_MIN_DAYS = 1;
export const LOOKBACK_MAX_DAYS = 730;

/**
 * A source's full scope, as returned by **both** `GET` and `PATCH
 * /sources/{id}/channels`. `lookbackDays` is the persisted window — the column
 * is NOT NULL backend-side, so this is always a real number and the picker can
 * show what's actually saved rather than a placeholder.
 */
export const SourceScopeSchema = z.object({
  channels: SourceChannelListSchema,
  lookbackDays: z.number().int().min(LOOKBACK_MIN_DAYS).max(LOOKBACK_MAX_DAYS),
});
export type SourceScope = z.infer<typeof SourceScopeSchema>;

/** `PATCH /sources/{id}/channels` request body — snake_case, `extra="forbid"`. */
export const ChannelSelectionSchema = z.object({
  channels: z.array(
    z.object({
      external_id: z.string(),
      name: z.string(),
      selected: z.boolean(),
    }),
  ),
  // Always sent, never omitted: the picker knows the saved value (it came back
  // on the read), so it can restate it and the response can echo it back.
  lookback_days: z.number().int().min(LOOKBACK_MIN_DAYS).max(LOOKBACK_MAX_DAYS),
});
export type ChannelSelection = z.infer<typeof ChannelSelectionSchema>;
