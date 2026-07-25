import { asSourceId } from "@/constants/sources";

import type { ReviewOut } from "./api";
import type { Review } from "./types";

/** Backend kind → a human label; unknown kinds pass through unchanged. */
const KIND_LABEL: Record<string, string> = {
  policy_change: "Policy change",
  new_decision: "New decision",
  contradiction: "Contradiction",
  exception: "Exception",
};

/**
 * Map the backend `ReviewOut` onto the card's view model, defaulting the many
 * nullable fields so the UI never renders `null`.
 *
 * Shared by the queue list and the single-review read, which return the same
 * shape and must therefore map identically.
 */
export function mapReview(r: ReviewOut): Review {
  return {
    id: r.id,
    title: r.title,
    src: asSourceId(r.sourceProvider),
    where: r.sourceLocation ?? "",
    kind: KIND_LABEL[r.kind] ?? r.kind,
    before: r.beforeText ?? "",
    after: r.afterText ?? "",
    quote: r.evidenceQuote ?? "",
    who: r.evidenceAuthor ?? "",
    conf: r.confidence ?? 0,
    isContradiction: r.kind === "contradiction",
  };
}
