import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth, useWorkspaceId } from "@/app/providers/AuthProvider";
import { BRAND } from "@/constants/brand";
import { asSourceId } from "@/constants/sources";
import { isApiError } from "@/lib/api";

import {
  brainApi,
  brainKeys,
  type BrainQueryResponse,
  type Conversation,
  type ConversationMessage,
  type SourceCitation,
} from "../api";
import { CHAT_SUGGESTIONS } from "../data/brain-answers";
import type { AnswerSource, ChatMessage } from "../types";

function greeting(firstName: string, workspaceName: string): ChatMessage {
  const who = firstName ? `Hi ${firstName}` : "Hi";
  return {
    role: "brain",
    text: `${who} — I'm ${workspaceName}'s brain. Ask me anything your team has decided, and I'll answer with sources.`,
    sources: [],
    conf: null,
  };
}

function mapCitation(c: SourceCitation): AnswerSource {
  return {
    source: asSourceId(c.provider),
    // Fall back through location → provider → a neutral label so a badge always
    // has something readable.
    where: c.location ?? c.provider ?? "Source",
    url: c.url,
    excerpt: c.excerpt,
  };
}

function mapAnswer(res: BrainQueryResponse): ChatMessage {
  return {
    role: "brain",
    text: res.answer,
    sources: res.sources.map(mapCitation),
    conf: res.confidence,
    trust: res.trust,
    provenance: res.provenance ?? null,
    interactionId: res.interactionId,
  };
}

/**
 * A replayed turn, narrowed to the same `ChatMessage` a live answer produces so
 * a restored thread renders through exactly one bubble component. The backend's
 * role vocabulary is `user` / `assistant`; anything that isn't `user` is treated
 * as the brain speaking.
 */
function mapStoredMessage(m: ConversationMessage): ChatMessage {
  const text = m.content ?? "";
  if (m.role === "user") return { role: "you", text };
  return {
    role: "brain",
    text,
    sources: m.sources.map(mapCitation),
    conf: m.confidence ?? null,
    trust: m.trust ?? undefined,
    provenance: m.provenance ?? null,
    interactionId: m.interactionId ?? undefined,
  };
}

export type BrainChatState = {
  messages: ChatMessage[];
  typing: boolean;
  /** Send a question to the brain (no-op while a reply is in flight or unready). */
  send: (text: string) => void;
  suggestions: string[];
  /** Live workspace name (falls back to the brand default pre-session). */
  workspaceName: string;
  /** True while the conversation is just the opening greeting. */
  showSuggestions: boolean;
  /** False when the backend says the brain can't answer yet. */
  ready: boolean;
  /** Human-readable reason the composer is disabled, or null when ready. */
  notReadyReason: string | null;

  // ── History ───────────────────────────────────────────────────────────────
  /** Past threads for the history sidebar, newest-active first. */
  conversations: Conversation[];
  /** True on the first load of the thread list. */
  conversationsLoading: boolean;
  /** The thread on screen, or `null` for an unsaved new one. */
  activeConversationId: string | null;
  /** The thread currently being replayed, or `null`. */
  loadingConversationId: string | null;
  /** Replace the transcript with a stored thread. */
  openConversation: (conversationId: string) => void;
  /** Reset to the greeting and detach from any stored thread. */
  startNewConversation: () => void;
};

const REASON_COPY: Record<string, string> = {
  disabled: "Brain chat is turned off for this workspace.",
  no_skills:
    "No skills are indexed yet — connect a source and build the brain before asking questions.",
};

/**
 * Owns the brain chat conversation against `POST /brain/query`, plus the thread
 * history behind `GET /brain/conversations` and
 * `GET /brain/conversations/{id}/messages`.
 *
 * Retrieval **and** synthesis happen server-side, so a reply takes seconds; the
 * typing indicator is driven by the real request rather than a timer. The
 * backend owns conversation persistence — it returns a `conversationId` on the
 * first answer, which every later question threads through so the server can
 * keep the history in `brain_conversations` / `brain_messages`. That id lives in
 * a ref for the *request* and is mirrored into state only for *rendering*, so
 * threading the next question never changes `send`'s identity (the dashboard's
 * global keydown listener depends on it staying stable).
 */
export function useBrainChat(): BrainChatState {
  const { user, workspace } = useAuth();
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const firstName = user?.name?.trim().split(" ")[0] ?? "";
  const workspaceName = workspace?.name ?? BRAND.workspace;

  // Lazy initializer: the greeting is seeded once from the session identity.
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    greeting(firstName, workspaceName),
  ]);

  // The ref is what the next request threads through; the state is what the
  // sidebar highlights. Always move them together via `setConversation`.
  const conversationId = useRef<string | undefined>(undefined);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const setConversation = useCallback((id: string | null) => {
    conversationId.current = id ?? undefined;
    setActiveConversationId(id);
  }, []);

  const statusQuery = useQuery({
    queryKey: brainKeys.status(workspaceId),
    queryFn: () => brainApi.status(),
    staleTime: 60 * 1000,
  });

  /**
   * The history sidebar. A failure here isn't worth an error surface: the route
   * is dashboard-JWT-only and 403s an agent key, and history is an accessory to
   * a chat that works perfectly well without it. It renders as an empty list
   * and isn't retried.
   */
  const conversationsQuery = useQuery({
    queryKey: brainKeys.conversations(workspaceId),
    queryFn: () => brainApi.conversations(),
    staleTime: 30 * 1000,
    retry: false,
  });

  const ask = useMutation({
    mutationFn: (question: string) =>
      brainApi.query({ question, conversationId: conversationId.current }),
    onSuccess: (res) => {
      setMessages((current) => [...current, mapAnswer(res)]);
      if (!res.conversationId) return;
      setConversation(res.conversationId);
      // The first answer creates the thread server-side and every later one
      // moves it up a list ordered by activity — refresh the sidebar either way.
      void queryClient.invalidateQueries({
        queryKey: brainKeys.conversations(workspaceId),
      });
      // The stored replay of this thread is now a turn behind.
      void queryClient.invalidateQueries({
        queryKey: brainKeys.messages(workspaceId, res.conversationId),
      });
    },
    onError: (error) => {
      setMessages((current) => [
        ...current,
        {
          role: "brain",
          text: isApiError(error)
            ? `I couldn't answer that: ${error.message}`
            : "I couldn't reach the brain right now. Try again in a moment.",
          sources: [],
          conf: null,
          isError: true,
        },
      ]);
    },
    // The failure is already rendered as a bubble in the transcript.
    meta: { errorToast: false },
  });

  /**
   * Replaying a thread is imperative (a click), not derived state — a `useQuery`
   * keyed on the active id would refetch in the background and stomp the live
   * transcript the user is mid-conversation in. Results still land in the query
   * cache, so reopening a thread is instant.
   */
  const openThread = useMutation({
    mutationFn: (id: string) =>
      queryClient.fetchQuery({
        queryKey: brainKeys.messages(workspaceId, id),
        queryFn: () => brainApi.messages(id),
        staleTime: 30 * 1000,
      }),
    onSuccess: (turns, id) => {
      setConversation(id);
      // An empty thread shouldn't render as a blank page — fall back to the
      // greeting so the composer still has something above it.
      setMessages(
        turns.length ? turns.map(mapStoredMessage) : [greeting(firstName, workspaceName)],
      );
    },
    meta: { errorMessage: "Couldn't open that conversation." },
  });

  const typing = ask.isPending;

  // Treat an unresolved status as ready: a slow gate shouldn't block the composer,
  // and a genuinely unready workspace still fails closed with a typed 409.
  const ready = statusQuery.data ? statusQuery.data.ready : true;
  const notReadyReason =
    statusQuery.data && !statusQuery.data.ready
      ? (REASON_COPY[statusQuery.data.reason ?? ""] ??
        "The brain isn't ready to answer yet.")
      : null;

  // `ask` is a fresh object every render; `ask.mutate` is stable. Depending on
  // the former made `send` — and every consumer memo downstream of it — churn on
  // every render.
  const { mutate: askBrain } = ask;
  const { mutate: loadThread } = openThread;

  const send = useCallback(
    (text: string) => {
      const question = text.trim();
      if (!question || typing || !ready) return;
      setMessages((current) => [...current, { role: "you", text: question }]);
      askBrain(question);
    },
    [askBrain, typing, ready],
  );

  const openConversation = useCallback(
    (id: string) => {
      // Re-opening the thread already on screen would only replace it with an
      // identical replay; switching mid-answer would orphan the reply in flight.
      if (id === conversationId.current || typing) return;
      loadThread(id);
    },
    [loadThread, typing],
  );

  const startNewConversation = useCallback(() => {
    if (typing) return;
    setConversation(null);
    setMessages([greeting(firstName, workspaceName)]);
  }, [typing, setConversation, firstName, workspaceName]);

  return {
    messages,
    typing,
    send,
    suggestions: CHAT_SUGGESTIONS,
    workspaceName,
    showSuggestions: messages.length === 1 && !typing,
    ready,
    notReadyReason,
    conversations: conversationsQuery.data ?? [],
    conversationsLoading: conversationsQuery.isPending,
    activeConversationId,
    loadingConversationId: openThread.isPending ? (openThread.variables ?? null) : null,
    openConversation,
    startNewConversation,
  };
}
