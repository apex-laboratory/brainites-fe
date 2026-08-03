import { useState } from "react";

import type { SegmentedOption } from "@/components/shared";

import type { DecisionStatus } from "../types";

export type DecisionFilter = "all" | DecisionStatus;

const FILTER_OPTIONS: SegmentedOption<DecisionFilter>[] = [
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active" },
  { value: "review", label: "Review" },
];

/**
 * Owns the decisions status filter.
 *
 * State only — the filter is applied **server-side** by passing it to
 * `useDecisions`. Filtering in memory would only ever search the pages already
 * loaded, so a status whose rows start on page 3 would look empty.
 */
export function useDecisionFilters() {
  const [filter, setFilter] = useState<DecisionFilter>("all");
  return { filter, setFilter, options: FILTER_OPTIONS };
}
