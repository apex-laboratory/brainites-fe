import { useMemo, useState } from "react";

import type { SegmentedOption } from "@/components/shared";

import type { Decision, DecisionStatus } from "../types";

export type DecisionFilter = "all" | DecisionStatus;

const FILTER_OPTIONS: SegmentedOption<DecisionFilter>[] = [
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active" },
  { value: "review", label: "Review" },
];

/** Owns the decisions status filter, applied client-side over the loaded list. */
export function useDecisionFilters(decisions: Decision[]) {
  const [filter, setFilter] = useState<DecisionFilter>("all");

  const filtered = useMemo<Decision[]>(
    () =>
      filter === "all"
        ? decisions
        : decisions.filter((decision) => decision.status === filter),
    [decisions, filter],
  );

  return { filter, setFilter, filtered, options: FILTER_OPTIONS };
}
