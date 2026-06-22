import { useEffect, useRef, useState } from "react";

import { AppIcon, StatusIndicator } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BRAND } from "@/constants/brand";
import { SOURCE_ORDER } from "@/constants/sources";

import { ChatMessage } from "../components/ChatMessage";
import { useBrainChatContext } from "../context/BrainChatContext";

/** Typing indicator (three bouncing dots) shown while the brain replies. */
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

/**
 * Full-page brain chat (replaces the old floating FAB + panel). A dedicated
 * dashboard tab styled like a modern assistant chat: a scrolling transcript
 * with a sticky composer pinned to the bottom. The conversation is shared via
 * `BrainChatContext`, so history survives navigating away and back.
 */
export function BrainChatPage() {
  const { messages, typing, send, suggestions, showSuggestions } =
    useBrainChatContext();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // autoscroll to the latest message (genuine DOM side effect)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const submit = (text?: string) => {
    const value = text ?? draft;
    if (!value.trim()) return;
    send(value);
    setDraft("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header */}
      <div className="flex items-center gap-2.5 border-b border-line bg-paper/80 px-6 py-3.5 backdrop-blur md:px-10">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] border border-line bg-cream text-ink">
          <AppIcon name="brain" size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold tracking-[-0.01em] text-ink">
            {BRAND.workspace} brain
          </div>
          <StatusIndicator
            tone="live"
            label={`Reading ${SOURCE_ORDER.length} sources · live`}
            pulse
          />
        </div>
      </div>

      {/* transcript */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[760px] flex-col gap-5 px-6 py-8 md:px-10">
          {messages.map((message, i) => (
            <ChatMessage key={i} message={message} />
          ))}
          {typing && <TypingIndicator />}

          {showSuggestions && (
            <div className="mt-1 flex flex-col gap-2">
              <span className="px-0.5 text-[13px] font-semibold text-ink-4">
                Try asking
              </span>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submit(suggestion)}
                  className="group flex w-full items-center gap-2 rounded-[12px] border border-line-2 bg-paper-2 px-3.5 py-3 text-left text-sm font-medium text-ink-2 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-ink"
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
      </div>

      {/* composer */}
      <div className="border-t border-line bg-paper/80 backdrop-blur">
        <div className="mx-auto max-w-[760px] px-6 py-4 md:px-10">
          <div className="flex items-end gap-2 rounded-2xl border border-line-2 bg-paper-2 p-2 shadow-soft-1 focus-within:border-brand">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder={`Ask ${BRAND.workspace}'s brain anything…`}
              aria-label="Ask the brain"
              rows={1}
              className="max-h-40 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              type="button"
              size="icon"
              onClick={() => submit()}
              disabled={typing || !draft.trim()}
              aria-label="Send"
              className="size-[38px] shrink-0"
            >
              <AppIcon name="arrowUp" size={18} />
            </Button>
          </div>
          <p className="mt-2 px-1 text-center text-[11.5px] text-ink-4">
            Answers are backed by your connected sources. Press Enter to send,
            Shift + Enter for a new line.
          </p>
        </div>
      </div>
    </div>
  );
}
