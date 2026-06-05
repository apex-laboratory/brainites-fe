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

/**
 * Owns the brain chat: open state, conversation, the typing indicator, and the
 * static answer matching. `ask` opens the panel and sends a seeded question
 * (used by the Overview suggestions and the command palette).
 */
export function useBrainChat() {
  const [isOpen, setIsOpen] = useState(false);
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

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  const ask = useCallback(
    (question: string) => {
      setIsOpen(true);
      send(question);
    },
    [send]
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    ask,
    send,
    messages,
    typing,
    suggestions: CHAT_SUGGESTIONS,
    showSuggestions: messages.length === 1 && !typing,
  };
}
