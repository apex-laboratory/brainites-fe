import { AppIcon, Skeleton, Spinner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/utils/date";
import { cn } from "@/utils/cn";

import { conversationTimestamp, type Conversation } from "../api";

export interface ConversationListProps {
  conversations: Conversation[];
  /** First load of the thread list. */
  loading: boolean;
  /** The thread on screen, or `null` for an unsaved new one. */
  activeId: string | null;
  /** The thread being replayed, or `null`. */
  loadingId: string | null;
  onSelect: (conversationId: string) => void;
  onNew: () => void;
  /** Disables every affordance while an answer is in flight. */
  busy?: boolean;
  /** Fired after a selection, so the mobile sheet can close itself. */
  onNavigate?: () => void;
  className?: string;
}

/** The server titles a thread from its first question; untitled ones still need a row. */
function title(conversation: Conversation): string {
  return conversation.title?.trim() || "Untitled conversation";
}

/**
 * The brain chat history rail — `GET /brain/conversations`. Selecting a row
 * replays it through `GET /brain/conversations/{id}/messages`.
 *
 * Threads are created by the backend on the first answer, so a brand-new chat
 * has no row until the brain replies. An empty list is therefore a normal
 * state, not a failure, and reads as one.
 */
export function ConversationList({
  conversations,
  loading,
  activeId,
  loadingId,
  onSelect,
  onNew,
  busy = false,
  onNavigate,
  className,
}: ConversationListProps) {
  const select = (id: string) => {
    onSelect(id);
    onNavigate?.();
  };

  return (
    <aside
      aria-label="Chat history"
      className={cn("flex min-h-0 flex-col bg-paper-2", className)}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <span className="flex-1 px-1 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-4">
          History
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onNew();
            onNavigate?.();
          }}
          disabled={busy}
          className="h-7 gap-1 px-2 text-[12.5px]"
        >
          <AppIcon name="plus" size={13} />
          New
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {loading ? (
          <div className="flex flex-col gap-1.5 px-1">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-[42px] w-full" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12.5px] leading-relaxed text-ink-4">
            No past chats yet. Ask the brain something and this thread will be
            saved here.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeId;
              const isLoading = conversation.id === loadingId;
              const when = formatRelativeTime(conversationTimestamp(conversation));

              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => select(conversation.id)}
                    disabled={busy || isLoading}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-[9px] px-2.5 py-2 text-left transition-colors",
                      "hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60",
                      isActive && "bg-paper shadow-soft-1",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-[13px] leading-tight text-ink-2",
                          isActive && "font-semibold text-ink",
                        )}
                      >
                        {title(conversation)}
                      </span>
                      {when && (
                        <span className="mt-0.5 block text-[11.5px] text-ink-4">
                          {when}
                        </span>
                      )}
                    </span>
                    {isLoading && <Spinner size={13} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
