import { useCallback, useState } from "react";

import type { SourceId } from "@/types/common";
import { DEFAULT_CHANNELS } from "@/features/onboarding/data/onboarding-fixtures";

/** Manages the per-source channel/page/repo selection on the configure step. */
export function useOnboardingChannels() {
  const [channels, setChannels] =
    useState<Record<SourceId, string[]>>(DEFAULT_CHANNELS);

  const toggle = useCallback((id: SourceId, channel: string) => {
    setChannels((prev) => {
      const current = prev[id] ?? [];
      const next = current.includes(channel)
        ? current.filter((c) => c !== channel)
        : [...current, channel];
      return { ...prev, [id]: next };
    });
  }, []);

  const countFor = useCallback(
    (id: SourceId) => (channels[id] ?? []).length,
    [channels]
  );

  const isSelected = useCallback(
    (id: SourceId, channel: string) => (channels[id] ?? []).includes(channel),
    [channels]
  );

  return { channels, toggle, countFor, isSelected };
}
