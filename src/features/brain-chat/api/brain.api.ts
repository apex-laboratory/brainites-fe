import { api } from "@/lib/api";

import {
  BrainQueryResponseSchema,
  BrainStatusSchema,
  type BrainQueryResponse,
  type BrainStatus,
} from "./brain.schemas";

export type BrainQueryBody = {
  /** The question (1–2000 chars, enforced by the backend). */
  question: string;
  /** Continues an existing thread; omit to start a new one. */
  conversationId?: string;
};

/**
 * Brain chat endpoint functions. Workspace scope comes from the JWT; RLS
 * backstops every read.
 *
 * `query` runs retrieval **and** LLM synthesis server-side, so it is far slower
 * than a plain read — callers should show a typing indicator, not a spinner. An
 * unready workspace fails with a typed 409 (`brain_not_ready`) before any
 * embedding or model spend, which is what `status` lets the UI pre-empt.
 */
export const brainApi = {
  status: (): Promise<BrainStatus> => api.get("/brain/status", BrainStatusSchema),

  query: (body: BrainQueryBody): Promise<BrainQueryResponse> =>
    api.post("/brain/query", BrainQueryResponseSchema, body),
};

/** Query keys for the brain feature (workspace-keyed so a switch can't serve stale). */
export const brainKeys = {
  all: (workspaceId: string) => ["brain", workspaceId] as const,
  status: (workspaceId: string) => ["brain", workspaceId, "status"] as const,
};
