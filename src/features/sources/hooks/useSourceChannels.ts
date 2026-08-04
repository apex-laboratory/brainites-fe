import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { sourceKeys, sourcesApi, type SourceChannel } from "../api";

/**
 * A source's scope — channels + lookback window — plus the local edit draft for
 * the scope dialog.
 *
 * The draft is stored as **overrides** (a sparse map for channels, a nullable
 * scalar for the lookback) rather than a copy of the server state. Nothing has
 * to be synced into state when the query resolves or refetches — the effective
 * value is always `override ?? server value` — so there's no stale-draft class
 * of bug here. `null` lookback means "not edited", *not* "unknown": the backend
 * sends the persisted window on every read, so the dialog always renders the
 * real saved value.
 *
 * `externalId` (not `id`) is the channel key: `id` is `null` for a channel the
 * provider exposes but we've never persisted a selection for.
 *
 * Pass `null` as `sourceId` to keep the query idle (dialog closed).
 */
export function useSourceChannels(sourceId: string | null) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: sourceKeys.scope(workspaceId, sourceId ?? "idle"),
    queryFn: () => sourcesApi.scope(sourceId as string),
    enabled: sourceId !== null,
  });

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  /** `null` means "the user hasn't touched the lookback in this session". */
  const [lookbackDraft, setLookbackDraft] = useState<number | null>(null);

  const channels = query.data?.channels ?? [];
  const savedLookbackDays = query.data?.lookbackDays ?? null;
  /** What the picker shows: the local edit if there is one, else what's saved. */
  const lookbackDays = lookbackDraft ?? savedLookbackDays;

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
    setLookbackDraft(null);
  }, []);

  const save = useMutation({
    mutationFn: () => {
      if (lookbackDays === null) {
        // Unreachable: Save can't be dirty before the scope read resolves.
        throw new Error("Scope hasn't loaded yet");
      }
      return sourcesApi.saveScope(sourceId as string, {
        channels: channels.map((channel) => ({
          external_id: channel.externalId,
          name: channel.name,
          selected: isSelected(channel),
        })),
        // Always sent — restating the saved value when untouched keeps the
        // request a complete description of the scope, and the response then
        // confirms what's stored.
        lookback_days: lookbackDays,
      });
    },

    onSuccess: (saved) => {
      // The PATCH returns the full persisted scope — seed the cache with it
      // rather than triggering another round trip. The draft is dropped in the
      // same tick, so the picker falls straight through to the saved value.
      queryClient.setQueryData(sourceKeys.scope(workspaceId, sourceId as string), saved);
      // Channel counts on the source cards are now stale. `exact` matters:
      // sourceKeys.all is a *prefix* of sourceKeys.scope, so without it this
      // would invalidate the scope query we just seeded — which is active
      // while the dialog is open, and would refetch immediately.
      void queryClient.invalidateQueries({
        queryKey: sourceKeys.all(workspaceId),
        exact: true,
      });
      reset();
      toast.success("Scope updated");
    },
  });

  const selectedCount = channels.filter(isSelected).length;
  const isDirty =
    (lookbackDraft !== null && lookbackDraft !== savedLookbackDays) ||
    channels.some((channel) => isSelected(channel) !== channel.selected);

  return {
    ...query,
    channels,
    isSelected,
    toggle,
    selectedCount,
    /** The window the picker should show — `null` only while the read is in flight. */
    lookbackDays,
    savedLookbackDays,
    setLookbackDays: setLookbackDraft,
    isDirty,
    reset,
    save: save.mutate,
    isSaving: save.isPending,
  };
}
