import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppIcon, SourceIcon } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { interactionsApi } from "@/features/skills/api";
import { isApiError } from "@/lib/api";

import type { BrainProvenance, Trust } from "../api";
import type { ChatMessage as ChatMessageType } from "../types";

export interface ChatMessageProps {
  message: ChatMessageType;
}

/** How grounded the answer is — the honest label, not a marketing one. */
const TRUST_BADGE: Record<Trust, { label: string; variant: "green" | "accent" | "amber" }> = {
  skill: { label: "Reviewed skill", variant: "green" },
  evidence: { label: "Cited evidence", variant: "accent" },
  none: { label: "No reviewed skill", variant: "amber" },
};

/** First recorded governance actor, in descending order of authority. */
function primaryActor(p: BrainProvenance) {
  const entries: [string, BrainProvenance[keyof BrainProvenance]][] = [
    ["Approved by", p.approvedBy],
    ["Last edited by", p.lastEditedBy],
    ["Created by", p.createdBy],
    ["Originated by", p.originatedBy],
  ];
  for (const [label, person] of entries) {
    if (person?.name) return { label, name: person.name, at: person.at };
  }
  return null;
}

/** A single chat bubble — user (right) or brain (left, with sources). */
export function ChatMessage({ message }: ChatMessageProps) {
  const override = useMutation({
    mutationFn: (interactionId: string) => interactionsApi.override(interactionId),
    onSuccess: () =>
      toast.success("Thanks — flagged for review", {
        description: "This answer's confidence was lowered and it may open a review item.",
      }),
    onError: (error) =>
      toast.error(isApiError(error) ? error.message : "Couldn't record that feedback."),
  });

  if (message.role === "you") {
    return (
      <div className="max-w-[82%] self-end rounded-[14px_14px_4px_14px] bg-solid px-3.5 py-2.5 text-sm leading-relaxed text-solid-ink">
        {message.text}
      </div>
    );
  }

  const hasSources = message.sources && message.sources.length > 0;
  const trust = message.trust ? TRUST_BADGE[message.trust] : null;
  const actor = message.provenance ? primaryActor(message.provenance) : null;
  const showMeta = hasSources || trust || message.conf != null;

  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid size-[26px] shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
        <AppIcon name="brain" size={15} />
      </span>
      <div className="min-w-0">
        <div className="whitespace-pre-line rounded-[4px_14px_14px_14px] bg-cream px-3.5 py-2.5 text-sm leading-relaxed text-ink">
          {message.text}
        </div>

        {showMeta && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {message.sources?.map((s, i) => {
              const body = (
                <>
                  {/* No icon when the provider isn't one the UI knows. */}
                  {s.source && <SourceIcon id={s.source} size={13} branded />}
                  {s.where}
                  {s.url && <AppIcon name="externalLink" size={11} />}
                </>
              );
              return s.url ? (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={s.excerpt ?? undefined}
                  className="rounded-md transition-opacity hover:opacity-80"
                >
                  <Badge variant="outline" className="gap-1.5">
                    {body}
                  </Badge>
                </a>
              ) : (
                <Badge
                  key={i}
                  variant="outline"
                  className="gap-1.5"
                  title={s.excerpt ?? undefined}
                >
                  {body}
                </Badge>
              );
            })}

            {trust && <Badge variant={trust.variant}>{trust.label}</Badge>}
            {message.conf != null && (
              <Badge variant="default">{message.conf}% confident</Badge>
            )}

            {message.interactionId && (
              <button
                type="button"
                aria-label="Flag this answer as wrong"
                title="Flag this answer as wrong"
                disabled={override.isPending || override.isSuccess}
                onClick={() => override.mutate(message.interactionId!)}
                className="grid size-6 place-items-center rounded-md text-ink-4 transition-colors hover:bg-cream hover:text-ink disabled:opacity-40"
              >
                <AppIcon name="warning" size={13} />
              </button>
            )}
          </div>
        )}

        {actor && (
          <p className="mt-1.5 px-0.5 text-[11.5px] text-ink-4">
            {actor.label} {actor.name}
            {actor.at && ` · ${new Date(actor.at).toLocaleDateString()}`}
          </p>
        )}
      </div>
    </div>
  );
}
