import { useMemo, useState } from "react";

import type { SegmentedOption } from "@/components/shared";

import { DECISIONS } from "../data/decisions";
import type { Decision, DecisionStatus } from "../types";

export type DecisionFilter = "all" | DecisionStatus;

const FILTER_OPTIONS: SegmentedOption<DecisionFilter>[] = [
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active" },
  { value: "review", label: "Review" },
];

/** Owns the decisions status filter and the resulting list. */
export function useDecisionFilters() {
  const [filter, setFilter] = useState<DecisionFilter>("all");

  const filtered = useMemo<Decision[]>(
    () =>
      filter === "all"
        ? DECISIONS
        : DECISIONS.filter((decision) => decision.status === filter),
    [filter]
  );

  return { filter, setFilter, filtered, options: FILTER_OPTIONS };
}
