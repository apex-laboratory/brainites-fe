import { useEffect, useRef, useState } from "react";

import { AppIcon, StatusIndicator } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND } from "@/constants/brand";

import type { ChatMessage as ChatMessageType } from "../types";
import { ChatMessage } from "./ChatMessage";

export interface BrainChatProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  send: (text: string) => void;
  messages: ChatMessageType[];
  typing: boolean;
  suggestions: string[];
  showSuggestions: boolean;
}

/** Typing indicator (three bouncing dots). */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-[26px] shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
        <AppIcon name="brain" size={15} />
      </span>
      <div className="inline-flex gap-1 rounded-[4px_14px_14px_14px] bg-cream px-3.5 py-3">
        {[0, 0.18, 0.36].map((delay) => (
          <span
            key={delay}
            className="size-1.5 rounded-full bg-ink-4 motion-safe:animate-[typing-dot_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Floating brain chat — FAB + slide-up conversational panel (prototype `BrainChat`). */
export function BrainChat({
  isOpen,
  open,
  close,
  send,
  messages,
  typing,
  suggestions,
  showSuggestions,
}: BrainChatProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // autoscroll to the latest message (genuine DOM side effect)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, isOpen]);

  const submit = (text?: string) => {
    const value = text ?? draft;
    if (!value.trim()) return;
    send(value);
    setDraft("");
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={open}
        aria-label="Ask the brain (⌘/)"
        className="fixed bottom-6 right-6 z-[60] grid size-[58px] place-items-center rounded-[18px] bg-brand text-white shadow-[0_10px_30px_var(--accent-glow),0_4px_12px_rgba(40,33,20,0.18)] transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.04]"
      >
        <AppIcon name="brain" size={26} />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[18px] border-2 border-brand motion-safe:animate-[fab-ping_2.6s_ease-out_infinite]"
        />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[61] flex h-[560px] max-h-[calc(100vh-48px)] w-[396px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-[20px] border border-line bg-paper shadow-soft-3 motion-safe:animate-[panel-up_0.26s_ease-out_both]">
      {/* header */}
      <div className="flex items-center gap-2.5 border-b border-line px-[18px] py-3.5">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-brand text-white shadow-[0_4px_12px_var(--accent-glow)]">
          <AppIcon name="brain" size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-bold tracking-[-0.01em] text-ink">
            {BRAND.workspace} brain
          </div>
          <StatusIndicator tone="live" label="Reading 5 sources · live" pulse />
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close chat"
          className="grid size-[34px] place-items-center rounded-[9px] text-ink-3 transition-colors hover:bg-cream hover:text-ink"
        >
          <AppIcon name="close" size={18} />
        </button>
      </div>

      {/* messages */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-[18px]"
      >
        {messages.map((message, i) => (
          <ChatMessage key={i} message={message} />
        ))}
        {typing && <TypingIndicator />}
        {showSuggestions && (
          <div className="mt-1 flex flex-col gap-1.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => submit(suggestion)}
                className="group flex w-full items-center gap-2 rounded-[11px] border border-line-2 bg-paper-2 px-3 py-2.5 text-left text-[13.5px] font-medium text-ink-2 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-ink"
              >
                {suggestion}
                <AppIcon
                  name="arrow"
                  size={14}
                  className="ml-auto text-ink-4 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-ink"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* input */}
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-xl border border-line-2 bg-paper-2 py-1 pl-3.5 pr-1">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            placeholder="Ask the brain…"
            aria-label="Ask the brain"
            className="h-[34px] border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="button"
            size="icon"
            onClick={() => submit()}
            aria-label="Send"
            className="size-[34px] shrink-0"
          >
            <AppIcon name="arrow" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
