import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useAuth, useWorkspaceId } from "@/app/providers/AuthProvider";
import { BRAND } from "@/constants/brand";
import { asSourceId } from "@/constants/sources";
import { isApiError } from "@/lib/api";

import { brainApi, brainKeys, type BrainQueryResponse, type SourceCitation } from "../api";
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
};

const REASON_COPY: Record<string, string> = {
  disabled: "Brain chat is turned off for this workspace.",
  no_skills:
    "No skills are indexed yet — connect a source and build the brain before asking questions.",
};

/**
 * Owns the brain chat conversation against `POST /brain/query`.
 *
 * Retrieval **and** synthesis happen server-side, so a reply takes seconds; the
 * typing indicator is driven by the real request rather than a timer. The
 * backend owns conversation persistence — it returns a `conversationId` on the
 * first answer, which every later question threads through so the server can
 * keep the history in `brain_conversations` / `brain_messages`.
 */
export function useBrainChat(): BrainChatState {
  const { user, workspace } = useAuth();
  const workspaceId = useWorkspaceId();
  const firstName = user?.name?.trim().split(" ")[0] ?? "";
  const workspaceName = workspace?.name ?? BRAND.workspace;

  // Lazy initializer: the greeting is seeded once from the session identity.
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    greeting(firstName, workspaceName),
  ]);

  // Held in a ref, not state: threading the next request must not re-render.
  const conversationId = useRef<string | undefined>(undefined);

  const statusQuery = useQuery({
    queryKey: brainKeys.status(workspaceId),
    queryFn: () => brainApi.status(),
    staleTime: 60 * 1000,
  });

  const ask = useMutation({
    mutationFn: (question: string) =>
      brainApi.query({ question, conversationId: conversationId.current }),
    onSuccess: (res) => {
      if (res.conversationId) conversationId.current = res.conversationId;
      setMessages((current) => [...current, mapAnswer(res)]);
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

  const send = useCallback(
    (text: string) => {
      const question = text.trim();
      if (!question || typing || !ready) return;
      setMessages((current) => [...current, { role: "you", text: question }]);
      ask.mutate(question);
    },
    [ask, typing, ready],
  );

  return {
    messages,
    typing,
    send,
    suggestions: CHAT_SUGGESTIONS,
    workspaceName,
    showSuggestions: messages.length === 1 && !typing,
    ready,
    notReadyReason,
  };
}
