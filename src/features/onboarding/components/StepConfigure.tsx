import { cn } from "@/utils/cn";
import { AppIcon } from "@/components/shared/AppIcon";
import { SourceIcon } from "@/components/shared/SourceIcon";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Card } from "@/components/ui/card";
import { SOURCES } from "@/constants/sources";
import type { SourceId } from "@/types/common";
import {
  CHANNELS,
  TIME_RANGES,
} from "@/features/onboarding/data/onboarding-fixtures";
import { OnboardingFrame } from "@/features/onboarding/components/OnboardingFrame";
import type { useOnboardingChannels } from "@/features/onboarding/hooks";
import type { CompanyForm } from "@/features/onboarding/types";

export interface StepConfigureProps {
  range: CompanyForm["range"];
  setRange: (range: string) => void;
  connectedIds: SourceId[];
  channels: ReturnType<typeof useOnboardingChannels>;
  onBack: () => void;
  onNext: () => void;
}

/** Configure step: time range + per-source scope selection. */
export function StepConfigure({
  range,
  setRange,
  connectedIds,
  channels,
  onBack,
  onNext,
}: StepConfigureProps) {
  return (
    <OnboardingFrame
      stepIndex={2}
      title="Choose what the brain should read"
      sub="Start narrow. You can widen your brain's coverage anytime."
      onBack={onBack}
      onNext={onNext}
      nextLabel="Build my brain"
    >
      <div className="flex flex-col gap-3.5">
        {/* time range segmented control */}
        <Card className="flex flex-wrap items-center gap-4 p-[18px] px-[22px]">
          <SectionLabel className="flex-none">Time range</SectionLabel>
          <div className="ml-auto flex gap-[3px] rounded-md bg-cream p-[3px]">
            {TIME_RANGES.map((r) => {
              const on = range === r;
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-[7px] px-4 py-[9px] text-[13.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    on
                      ? "bg-paper-2 text-ink shadow-soft-1"
                      : "text-ink-3 hover:text-ink"
                  )}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </Card>

        {/* connected source scopes */}
        {connectedIds.map((id) => (
          <Card key={id} className="p-[18px] px-[22px]">
            <div className="mb-3.5 flex items-center gap-2.5">
              <SourceIcon id={id} size={20} branded />
              <span className="text-[15px] font-bold text-ink">
                {SOURCES[id].name}
              </span>
              <span className="ml-1.5 text-[12.5px] text-ink-4">
                {channels.countFor(id)} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {CHANNELS[id].map((channel) => {
                const on = channels.isSelected(id, channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    aria-pressed={on}
                    onClick={() => channels.toggle(id, channel)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      on
                        ? "border-primary bg-brand-soft text-brand-ink"
                        : "border-line-2 bg-paper text-ink-2 hover:border-ink-4"
                    )}
                  >
                    {on && <AppIcon name="check" size={13} />}
                    {channel}
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </OnboardingFrame>
  );
}
