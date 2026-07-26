import { AppIcon } from "@/components/shared/AppIcon";
import { Spinner } from "@/components/shared/QueryState";
import { SourceIcon } from "@/components/shared/SourceIcon";
import { SOURCES, SOURCE_ORDER, asSourceId } from "@/constants/sources";
import { cn } from "@/utils/cn";
import type { SweepProviderProgress } from "@/features/onboarding/api";

/** Backend error codes worth translating; anything else is shown verbatim. */
const ERROR_COPY: Record<string, string> = {
  sync_failed: "couldn't be synced. Please reconnect it.",
  rate_limited: "hit the provider's rate limit. It'll retry automatically.",
  unauthorized: "needs to be reconnected — its access expired.",
};

function providerName(provider: string): string {
  const id = asSourceId(provider);
  return id ? SOURCES[id].name : provider;
}

/** Stable display order: known providers in canonical order, unknowns last. */
function ordered(entries: SweepProviderProgress[]): SweepProviderProgress[] {
  const rank = (provider: string) => {
    const id = asSourceId(provider);
    const index = id ? SOURCE_ORDER.indexOf(id) : -1;
    return index === -1 ? SOURCE_ORDER.length : index;
  };
  return [...entries].sort((a, b) => rank(a.provider) - rank(b.provider));
}

export interface SweepProgressListProps {
  entries: SweepProviderProgress[];
}

/**
 * One row per provider in the sweep's `progress` map: a live inserted count and
 * a spinner / check / warning.
 *
 * Failed providers are shown alongside successful ones rather than replacing
 * them — a sweep that ingested Slack, Notion and Drive but lost GitHub still
 * completed, and hiding the three that worked would misreport the outcome.
 *
 * Rows are keyed by provider, not by connection: two connected Drive accounts
 * arrive as a single `google_drive` entry with summed counts.
 */
export function SweepProgressList({ entries }: SweepProgressListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {ordered(entries).map((entry) => {
        const id = asSourceId(entry.provider);
        const name = providerName(entry.provider);
        const failed = entry.status === "failed";
        const completed = entry.status === "completed";

        return (
          <li
            key={entry.provider}
            className={cn(
              "flex items-center gap-3.5 rounded-xl border px-4 py-3 backdrop-blur-sm transition-colors",
              failed
                ? "border-amber/40 bg-amber/10"
                : completed
                  ? "border-white/10 bg-white/10"
                  : "border-white/25 bg-white/15",
            )}
          >
            <span className="grid size-[26px] flex-none place-items-center rounded-lg bg-white/15">
              {id ? (
                <SourceIcon id={id} size={16} />
              ) : (
                <AppIcon name="database" size={15} className="text-white/70" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-semibold tracking-tight text-white">
                {name}
              </div>
              <div className="mt-px text-[12.5px] text-white/65">
                {failed ? (
                  <>
                    {name}{" "}
                    {ERROR_COPY[entry.error ?? ""] ??
                      (entry.error
                        ? `failed: ${entry.error}`
                        : "couldn't be synced. Please reconnect it.")}
                  </>
                ) : (
                  <>
                    {entry.inserted.toLocaleString()} item
                    {entry.inserted === 1 ? "" : "s"}
                    {completed ? " ingested" : " so far…"}
                  </>
                )}
              </div>
            </div>

            <span className="grid size-[20px] flex-none place-items-center">
              {failed ? (
                <AppIcon name="warning" size={18} className="text-amber" />
              ) : completed ? (
                <AppIcon name="checkCircle" size={20} className="text-green-300" />
              ) : (
                <Spinner size={17} tone="light" />
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
