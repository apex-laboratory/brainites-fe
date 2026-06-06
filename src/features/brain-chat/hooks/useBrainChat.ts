import { useCallback, useState } from "react";

import { BRAND } from "@/constants/brand";
import { CURRENT_USER } from "@/features/dashboard/data/workspace";

import { answerFor } from "../data/answer-for";
import { CHAT_SUGGESTIONS } from "../data/brain-answers";
import type { ChatMessage } from "../types";

const REPLY_DELAY_MS = 850;

function greeting(): ChatMessage {
  const firstName = CURRENT_USER.name.split(" ")[0];
  return {
    role: "brain",
    text: `Hi ${firstName} — I'm ${BRAND.workspace}'s brain. Ask me anything your team has decided, and I'll answer with sources.`,
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
  const [messages, setMessages] = useState<ChatMessage[]>([greeting()]);
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
