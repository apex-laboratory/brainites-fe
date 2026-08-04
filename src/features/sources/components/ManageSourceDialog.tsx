import { useState, type ReactNode } from "react";

import {
  AppIcon,
  ErrorState,
  SectionLabel,
  Segmented,
  Skeleton,
  SourceTile,
  type SegmentedOption,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SourceMeta } from "@/constants/sources";
import { cn } from "@/utils/cn";

import type { Source, SourceChannel } from "../api";
import { useDisconnectSource } from "../hooks/useDisconnectSource";
import { useSourceChannels } from "../hooks/useSourceChannels";
import { SourceStatusLine } from "./SourceStatus";

/** The windows we offer. The saved value always wins over these — see
 * {@link lookbackOptions} — so a connection scoped to something off-list (the
 * API accepts 1–730) still shows its real setting. */
const LOOKBACK_PRESETS = [30, 90, 180, 365] as const;

function lookbackLabel(days: number): string {
  if (days === 365) return "1 year";
  if (days === 730) return "2 years";
  if (days % 30 === 0 && days >= 150) return `${days / 30} months`;
  return `${days} days`;
}

/**
 * Preset windows, plus the saved one when it isn't a preset — the segmented
 * control has no "other" state, so an unlisted saved value would otherwise
 * render with nothing selected.
 */
function lookbackOptions(saved: number | null): SegmentedOption<string>[] {
  const days =
    saved === null || LOOKBACK_PRESETS.includes(saved as (typeof LOOKBACK_PRESETS)[number])
      ? [...LOOKBACK_PRESETS]
      : [...LOOKBACK_PRESETS, saved].sort((a, b) => a - b);
  return days.map((d) => ({ value: String(d), label: lookbackLabel(d) }));
}

export interface ManageSourceDialogProps {
  source: Source;
  meta: SourceMeta;
  trigger: ReactNode;
}

/**
 * Scope dialog for one connected source: which channels / pages / repos the
 * brain reads, how far back to look, and disconnecting.
 *
 * The scope query stays idle until the dialog opens, so a grid of cards doesn't
 * fire one request per source on mount. It returns the saved lookback along with
 * the channels, so both controls open showing what's actually persisted.
 */
export function ManageSourceDialog({ source, meta, trigger }: ManageSourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  const channels = useSourceChannels(open ? source.id : null);
  const disconnect = useDisconnectSource();

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) {
      channels.reset();
      setConfirmingDisconnect(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <SourceTile id={source.provider} size={40} iconSize={22} />
            <div className="min-w-0">
              <DialogTitle>{meta.name}</DialogTitle>
              <SourceStatusLine source={source} className="mt-0.5" />
            </div>
          </div>
          <DialogDescription className="pt-1">
            Choose what this source contributes. Read-only — Brainite never writes
            back to {meta.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Hidden outright on a failed read — the picker below owns the error
              surface, and a control with no selection would misreport the scope. */}
          {!channels.isError && (
            <div className="flex flex-wrap items-center gap-3">
              <SectionLabel className="flex-none pb-0">Look back</SectionLabel>
              {channels.lookbackDays === null ? (
                <Skeleton className="ml-auto h-[38px] w-[280px]" />
              ) : (
                <Segmented
                  ariaLabel="Lookback window"
                  className="ml-auto"
                  value={String(channels.lookbackDays)}
                  options={lookbackOptions(channels.savedLookbackDays)}
                  onChange={(choice) => channels.setLookbackDays(Number(choice))}
                />
              )}
            </div>
          )}

          <div>
            <div className="mb-2.5 flex items-center gap-2">
              <SectionLabel className="pb-0">Reading from</SectionLabel>
              {!channels.isPending && !channels.isError && (
                <span className="text-[12.5px] text-ink-4">
                  {channels.selectedCount} of {channels.channels.length} selected
                </span>
              )}
            </div>
            <ChannelPicker {...channels} />
          </div>
        </div>

        <div className="mt-1 flex items-center gap-2.5">
          <Button
            variant={confirmingDisconnect ? "solid" : "ghost"}
            size="sm"
            disabled={disconnect.isPending}
            onClick={() => {
              if (!confirmingDisconnect) return setConfirmingDisconnect(true);
              disconnect.mutate(source.id, { onSuccess: () => close(false) });
            }}
          >
            <AppIcon name="disconnect" size={14} />
            {confirmingDisconnect ? "Confirm disconnect" : "Disconnect"}
          </Button>

          {confirmingDisconnect && (
            <span className="text-[12px] text-ink-3">
              Stops syncing and deletes the connection.
            </span>
          )}

          <Button
            variant="solid"
            size="sm"
            className="ml-auto"
            disabled={!channels.isDirty || channels.isSaving}
            onClick={() => channels.save()}
          >
            {channels.isSaving ? "Saving…" : "Save scope"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ChannelPickerProps = Pick<
  ReturnType<typeof useSourceChannels>,
  "channels" | "isPending" | "isError" | "error" | "refetch" | "isSelected" | "toggle"
>;

/** The channel chip grid, with its own read states. */
function ChannelPicker({
  channels,
  isPending,
  isError,
  error,
  refetch,
  isSelected,
  toggle,
}: ChannelPickerProps) {
  if (isPending) {
    return (
      <div className="flex flex-wrap gap-2.5">
        {["w-28", "w-24", "w-32", "w-20", "w-24"].map((width, i) => (
          <Skeleton key={i} className={cn("h-[38px]", width)} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        title="Couldn't load channels"
      />
    );
  }

  if (channels.length === 0) {
    return (
      <p className="rounded-md border border-line bg-paper px-3.5 py-3 text-[13px] text-ink-3">
        This source hasn't exposed anything to read yet. It may still be finishing
        its first sync.
      </p>
    );
  }

  return (
    <div className="max-h-[280px] overflow-y-auto">
      <div className="flex flex-wrap gap-2.5">
        {channels.map((channel) => (
          <ChannelChip
            key={channel.externalId}
            channel={channel}
            selected={isSelected(channel)}
            onToggle={() => toggle(channel)}
          />
        ))}
      </div>
    </div>
  );
}

function ChannelChip({
  channel,
  selected,
  onToggle,
}: {
  channel: SourceChannel;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary bg-brand-soft text-brand-ink"
          : "border-line-2 bg-paper text-ink-2 hover:border-ink-4",
      )}
    >
      {selected && <AppIcon name="check" size={13} />}
      {channel.name}
      {channel.itemCount > 0 && (
        <span className="tnum text-[11.5px] text-ink-4">{channel.itemCount}</span>
      )}
    </button>
  );
}
