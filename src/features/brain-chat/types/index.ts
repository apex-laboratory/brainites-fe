import type { SourceId } from "@/types/common";

import type { BrainProvenance, Trust } from "../api";

/**
 * A citation on a brain answer, narrowed for rendering.
 *
 * `source` is null when the backend reported a provider the UI doesn't know (or
 * none at all) — the badge then renders without an icon rather than guessing.
 * `url`/`excerpt` come from the evidence graph and may be absent.
 */
export type AnswerSource = {
  source: SourceId | null;
  where: string;
  url?: string | null;
  excerpt?: string | null;
};

export type ChatRole = "you" | "brain";

export type ChatMessage = {
  role: ChatRole;
  text: string;
  sources?: AnswerSource[];
  /** Confidence 0–100. Null on the greeting and on transport errors. */
  conf?: number | null;
  /** How grounded the answer is; `none` means no reviewed skill covered it. */
  trust?: Trust;
  /** Governance dossier for the primary matched skill, when the backend has one. */
  provenance?: BrainProvenance | null;
  /** Feeds `POST /interactions/{id}/override` on a thumbs-down. */
  interactionId?: string;
  /** True for locally-generated failure notices (never a backend answer). */
  isError?: boolean;
};
