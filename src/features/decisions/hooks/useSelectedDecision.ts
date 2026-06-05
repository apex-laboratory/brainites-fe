import { useState } from "react";

import type { Decision } from "../types";

/**
 * Tracks the selected decision within a (possibly filtered) list. The current
 * decision is derived — when the selection falls outside the list it falls
 * back to the first item, so no effect is needed to keep them in sync.
 */
export function useSelectedDecision(list: Decision[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected =
    list.find((decision) => decision.id === selectedId) ?? list[0] ?? null;

  return { selectedId: selected?.id ?? null, setSelectedId, selected };
}
