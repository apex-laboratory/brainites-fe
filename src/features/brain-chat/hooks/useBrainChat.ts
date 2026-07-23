import { useCallback, useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { BRAND } from "@/constants/brand";

import { answerFor } from "../data/answer-for";
import { CHAT_SUGGESTIONS } from "../data/brain-answers";
import type { ChatMessage } from "../types";

const REPLY_DELAY_MS = 850;

function greeting(firstName: string, workspaceName: string): ChatMessage {
  const who = firstName ? `Hi ${firstName}` : "Hi";
  return {
    role: "brain",
    text: `${who} — I'm ${workspaceName}'s brain. Ask me anything your team has decided, and I'll answer with sources.`,
    sources: [],
    conf: null,
  };
}

export type BrainChatState = {
  messages: ChatMessage[];
  typing: boolean;
  /** Send a question to the brain (no-op while a reply is in flight). */
  send: (text: string) => void;
  suggestions: string[];
  /** True while the conversation is just the opening greeting. */
  showSuggestions: boolean;
};

/**
 * Owns the brain chat conversation: the message list, the typing indicator,
 * and the static answer matching. The chat now lives on its own full-page tab
 * (`BrainChatPage`), so this hook no longer tracks panel open/close state — it
 * is instantiated once in `DashboardLayout` and shared through
 * `BrainChatContext` so the conversation persists across navigation.
 */
export function useBrainChat(): BrainChatState {
  const { user, workspace } = useAuth();
  const firstName = user?.name?.trim().split(" ")[0] ?? "";
  const workspaceName = workspace?.name ?? BRAND.workspace;

  // Lazy initializer: the greeting is seeded once from the session identity.
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    greeting(firstName, workspaceName),
  ]);
  const [typing, setTyping] = useState(false);

  const send = useCallback(
    (text: string) => {
      const query = text.trim();
      if (!query || typing) return;

      setMessages((current) => [...current, { role: "you", text: query }]);
      setTyping(true);

      window.setTimeout(() => {
        const reply = answerFor(query);
        setMessages((current) => [
          ...current,
          { role: "brain", text: reply.text, sources: reply.sources, conf: reply.conf },
        ]);
        setTyping(false);
      }, REPLY_DELAY_MS);
    },
    [typing]
  );

  return {
    messages,
    typing,
    send,
    suggestions: CHAT_SUGGESTIONS,
    showSuggestions: messages.length === 1 && !typing,
  };
}
