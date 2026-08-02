import { api } from "@/lib/api";

import {
  BrainQueryResponseSchema,
  BrainStatusSchema,
  ConversationListSchema,
  ConversationMessageListSchema,
  type BrainQueryResponse,
  type BrainStatus,
  type Conversation,
  type ConversationMessage,
} from "./brain.schemas";

/** The backend caps `limit` at 100; 50 is its default and plenty for a sidebar. */
const CONVERSATION_PAGE_SIZE = 50;

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

  /**
   * The signed-in user's threads, newest-active first. Dashboard JWT only —
   * an agent key has no persisted conversations and gets a 403, which is why
   * the sidebar treats a failure as "no history" rather than an error screen.
   */
  conversations: (limit = CONVERSATION_PAGE_SIZE): Promise<Conversation[]> =>
    api.get("/brain/conversations", ConversationListSchema, { params: { limit } }),

  /** Replay one thread's turns, oldest first, so a reload can restore it. */
  messages: (conversationId: string): Promise<ConversationMessage[]> =>
    api.get(
      `/brain/conversations/${conversationId}/messages`,
      ConversationMessageListSchema,
    ),
};

/** Query keys for the brain feature (workspace-keyed so a switch can't serve stale). */
export const brainKeys = {
  all: (workspaceId: string) => ["brain", workspaceId] as const,
  status: (workspaceId: string) => ["brain", workspaceId, "status"] as const,
  conversations: (workspaceId: string) =>
    ["brain", workspaceId, "conversations"] as const,
  messages: (workspaceId: string, conversationId: string) =>
    ["brain", workspaceId, "conversations", conversationId] as const,
};
