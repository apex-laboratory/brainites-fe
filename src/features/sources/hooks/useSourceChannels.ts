import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { sourceKeys, sourcesApi, type SourceChannel } from "../api";

/**
 * A source's channels plus the local edit draft for the scope dialog.
 *
 * The draft is stored as a sparse map of **overrides** keyed by `externalId`
 * rather than a copy of the server list. Nothing has to be synced into state
 * when the query resolves or refetches — the effective selection is always
 * `override ?? server value` — so there's no stale-draft class of bug here.
 *
 * `externalId` (not `id`) is the key: `id` is `null` for a channel the provider
 * exposes but we've never persisted a selection for.
 *
 * Pass `null` as `sourceId` to keep the query idle (dialog closed).
 */
export function useSourceChannels(sourceId: string | null) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: sourceKeys.channels(workspaceId, sourceId ?? "idle"),
    queryFn: () => sourcesApi.channels(sourceId as string),
    enabled: sourceId !== null,
  });

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  /** `null` means "leave the backend's current lookback untouched". */
  const [lookbackDays, setLookbackDays] = useState<number | null>(null);

  const channels = query.data ?? [];

  const isSelected = useCallback(
    (channel: SourceChannel) => overrides[channel.externalId] ?? channel.selected,
    [overrides],
  );

  const toggle = useCallback((channel: SourceChannel) => {
    setOverrides((prev) => ({
      ...prev,
      [channel.externalId]: !(prev[channel.externalId] ?? channel.selected),
    }));
  }, []);

  const reset = useCallback(() => {
    setOverrides({});
    setLookbackDays(null);
  }, []);

  const save = useMutation({
    mutationFn: () =>
      sourcesApi.saveChannels(sourceId as string, {
        channels: channels.map((channel) => ({
          external_id: channel.externalId,
          name: channel.name,
          selected: isSelected(channel),
        })),
        ...(lookbackDays !== null && { lookback_days: lookbackDays }),
      }),

    onSuccess: (saved) => {
      // The PATCH returns the full persisted list — seed the cache with it
      // rather than triggering another round trip.
      queryClient.setQueryData(sourceKeys.channels(workspaceId, sourceId as string), saved);
      // Channel counts on the source cards are now stale.
      void queryClient.invalidateQueries({ queryKey: sourceKeys.all(workspaceId) });
      reset();
      toast.success("Scope updated");
    },
  });

  const selectedCount = channels.filter(isSelected).length;
  const isDirty =
    lookbackDays !== null ||
    channels.some((channel) => isSelected(channel) !== channel.selected);

  return {
    ...query,
    channels,
    isSelected,
    toggle,
    selectedCount,
    lookbackDays,
    setLookbackDays,
    isDirty,
    reset,
    save: save.mutate,
    isSaving: save.isPending,
  };
}
