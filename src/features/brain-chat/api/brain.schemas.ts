import { z } from "zod";

import { IsoDateTimeSchema } from "@/lib/api/schemas";

/**
 * Zod schemas for the brain chat API (`/api/v1/brain`), per the backend
 * `BrainStatusResponse` / `BrainQueryResponse` models
 * (`app/modules/brain/schemas.py`, BACKEND_ASKS §7).
 *
 * Both routes are gated by `require_brain_access("brain:query")`, which admits a
 * dashboard JWT at role >= viewer, so the normal session token reaches them.
 */

/** `GET /brain/status` — lets the UI gate the composer without firing a 409. */
export const BrainStatusSchema = z.object({
  enabled: z.boolean(),
  ready: z.boolean(),
  skillsIndexed: z.number(),
  /** `null` when ready, else `"disabled"` (kill-switch) or `"no_skills"`. */
  reason: z.enum(["disabled", "no_skills"]).nullish(),
});
export type BrainStatus = z.infer<typeof BrainStatusSchema>;

/**
 * One source the answer drew on. `provider` is a raw backend provider id; the UI
 * narrows it to a known `SourceId` before rendering an icon. `url`/`excerpt` are
 * filled from the Phase 3 evidence graph and may be absent on older answers.
 */
export const SourceCitationSchema = z.object({
  provider: z.string().nullish(),
  location: z.string().nullish(),
  skillId: z.string().nullish(),
  url: z.string().nullish(),
  excerpt: z.string().nullish(),
});
export type SourceCitation = z.infer<typeof SourceCitationSchema>;

/**
 * A governance actor in a skill's lineage. Every field is nullable by design —
 * the backend returns `null` when the write path never recorded it rather than
 * letting the model infer one, so the UI must render partial people.
 */
export const ProvenancePersonSchema = z.object({
  name: z.string().nullish(),
  at: IsoDateTimeSchema.nullish(),
  via: z.string().nullish(),
  location: z.string().nullish(),
  changeType: z.string().nullish(),
});
export type ProvenancePerson = z.infer<typeof ProvenancePersonSchema>;

export const BrainProvenanceSchema = z.object({
  approvedBy: ProvenancePersonSchema.nullish(),
  originatedBy: ProvenancePersonSchema.nullish(),
  createdBy: ProvenancePersonSchema.nullish(),
  lastEditedBy: ProvenancePersonSchema.nullish(),
});
export type BrainProvenance = z.infer<typeof BrainProvenanceSchema>;

/**
 * How much the answer can be trusted:
 * `skill` — a reviewed rule · `evidence` — a cited source in a skill's lineage ·
 * `none` — no reviewed skill covers it (an honest miss, never a guess).
 */
export const TrustSchema = z.enum(["skill", "evidence", "none"]).catch("none");
export type Trust = z.infer<typeof TrustSchema>;

/** `POST /brain/query` — the answer envelope. */
export const BrainQueryResponseSchema = z.object({
  answer: z.string(),
  trust: TrustSchema,
  confidence: z.number(),
  matchType: z.string(),
  sources: z.array(SourceCitationSchema).catch([]),
  skillIds: z.array(z.string()).catch([]),
  provenance: BrainProvenanceSchema.nullish(),
  conversationId: z.string().nullish(),
  messageId: z.string().nullish(),
  /** Always present — pass to `POST /interactions/{id}/override` on a thumbs-down. */
  interactionId: z.string(),
});
export type BrainQueryResponse = z.infer<typeof BrainQueryResponseSchema>;

// ── Conversation history ────────────────────────────────────────────────────
// `GET /brain/conversations` and `GET /brain/conversations/{id}/messages` are
// the two routes the OpenAPI document declares with an **empty** response
// schema (`"schema": {}`) — the backend never attached a response model. So
// unlike every other schema in this file, these are written defensively rather
// than from a known contract: only `id`/`role` are load-bearing, a list that
// arrives wrapped is unwrapped, and a row that fails to parse is dropped
// instead of failing the whole read. History is an accessory to the chat; a
// label drifting must never blank the sidebar or the transcript.

/** Accept a bare array, or one wrapped under a conventional key. */
function unwrapList(value: unknown): unknown {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    for (const key of ["items", "conversations", "messages", "data"]) {
      const inner = (value as Record<string, unknown>)[key];
      if (Array.isArray(inner)) return inner;
    }
  }
  return value;
}

/** A list that yields only the rows that parse, and `[]` for anything else. */
function lenientArray<T>(item: z.ZodType<T, z.ZodTypeDef, unknown>) {
  return z.preprocess(unwrapList, z.array(z.unknown()).catch([])).transform((rows) =>
    rows.flatMap((row) => {
      const parsed = item.safeParse(row);
      return parsed.success ? [parsed.data] : [];
    }),
  );
}

/** A display-only timestamp: never worth failing a row over. */
const SoftDateTime = IsoDateTimeSchema.nullish().catch(null);

/** One row in the history sidebar. `title` is server-generated from the first turn. */
export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string().nullish(),
  /** Newest activity. The backend orders by it; we only render it. */
  updatedAt: SoftDateTime,
  /** Accepted as an alias — whichever the backend emits, `sortedAt` picks one. */
  lastMessageAt: SoftDateTime,
  createdAt: SoftDateTime,
  messageCount: z.number().nullish(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

export const ConversationListSchema = lenientArray(ConversationSchema);

/** The timestamp to show/sort by, whichever of the three the backend filled. */
export function conversationTimestamp(c: Conversation): string | null {
  return c.updatedAt ?? c.lastMessageAt ?? c.createdAt ?? null;
}

/** Coalesce the body field: the route is untyped, so accept the usual names. */
const withContent = (value: unknown): unknown => {
  if (!value || typeof value !== "object") return value;
  const row = value as Record<string, unknown>;
  if (typeof row.content === "string") return row;
  const alt = [row.text, row.answer, row.question].find((v) => typeof v === "string");
  return alt === undefined ? row : { ...row, content: alt };
};

/**
 * One replayed turn. `role` is the backend's own vocabulary (`user` /
 * `assistant`); the mapper narrows it to the UI's `you` / `brain`. The answer
 * metadata mirrors `BrainQueryResponse` so a restored thread renders through
 * exactly the same bubble as a live one.
 */
export const ConversationMessageSchema = z.preprocess(
  withContent,
  z.object({
    id: z.string().nullish(),
    role: z.string(),
    content: z.string().nullish(),
    createdAt: SoftDateTime,
    confidence: z.number().nullish(),
    trust: TrustSchema.nullish(),
    sources: z.array(SourceCitationSchema).catch([]),
    provenance: BrainProvenanceSchema.nullish(),
    interactionId: z.string().nullish(),
  }),
);
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;

export const ConversationMessageListSchema = lenientArray(ConversationMessageSchema);
