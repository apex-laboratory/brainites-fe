import { AppIcon, SourceIcon } from "@/components/shared";
import { Badge } from "@/components/ui/badge";

import type { ChatMessage as ChatMessageType } from "../types";

export interface ChatMessageProps {
  message: ChatMessageType;
}

/** A single chat bubble — user (right) or brain (left, with sources). */
export function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === "you") {
    return (
      <div className="max-w-[82%] self-end rounded-[14px_14px_4px_14px] bg-solid px-3.5 py-2.5 text-sm leading-relaxed text-solid-ink">
        {message.text}
      </div>
    );
  }

  const hasSources = message.sources && message.sources.length > 0;

  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid size-[26px] shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
        <AppIcon name="brain" size={15} />
      </span>
      <div className="min-w-0">
        <div className="rounded-[4px_14px_14px_14px] bg-cream px-3.5 py-2.5 text-sm leading-relaxed text-ink">
          {message.text}
        </div>
        {hasSources && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {message.sources!.map(([source, where], i) => (
              <Badge key={i} variant="outline" className="gap-1.5">
                <SourceIcon id={source} size={13} branded />
                {where}
              </Badge>
            ))}
            {message.conf != null && (
              <Badge variant="accent">{message.conf}% confident</Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
