import { asSourceId } from "@/constants/sources";
import { formatCompact } from "@/utils/format";
import { formatRelativeTime } from "@/utils/date";

import type { DecisionOut } from "./api";
import type { Decision, DecisionStatus } from "./types";

/** Coerce the backend status onto a known filterable status; default `review`. */
export function asStatus(status: string): DecisionStatus {
  return status === "approved" || status === "active" || status === "review"
    ? status
    : "review";
}

/**
 * Map the backend `DecisionOut` onto the page's view model, defaulting the many
 * nullable fields so the UI never renders `null`.
 *
 * Shared by the list and the detail fetch — `/decisions` and
 * `/decisions/{id}` return the same shape, so they must map identically or the
 * panel would visibly change when the detail response lands.
 */
export function mapDecision(d: DecisionOut): Decision {
  return {
    id: d.id,
    title: d.title,
    src: asSourceId(d.provider),
    where: d.location ?? "",
    status: asStatus(d.status),
    conf: d.confidence ?? 0,
    cat: d.category ?? "General",
    owner: d.owner?.name ?? "Unassigned",
    oc: d.owner?.avatarColor ?? "#8A8577",
    uses: formatCompact(d.uses),
    updated: formatRelativeTime(d.updatedAt) ?? "—",
    body: d.body ?? "",
    rule: d.rule ?? "",
  };
}
