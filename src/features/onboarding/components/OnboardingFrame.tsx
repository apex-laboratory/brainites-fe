import type { ReactNode } from "react";

import { cn } from "@/utils/cn";
import { AppLogo } from "@/components/shared/AppLogo";
import { AppIcon } from "@/components/shared/AppIcon";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Button } from "@/components/ui/button";
import { SETUP_STEPS } from "@/features/onboarding/data/onboarding-fixtures";

/** Vertical setup stepper shown in the left rail. */
function Stepper({ active }: { active: number }) {
  return (
    <div className="flex flex-col">
      {SETUP_STEPS.map((s, i) => {
        const done = i < active;
        const current = i === active;
        const isLast = i === SETUP_STEPS.length - 1;
        return (
          <div key={s.key} className="flex items-stretch gap-3">
            <div className="flex w-[30px] flex-none flex-col items-center">
              <div
                className={cn(
                  "grid size-[30px] flex-none place-items-center rounded-full text-[13px] font-bold transition-all",
                  done && "bg-primary text-primary-foreground",
                  current && "border-2 border-primary bg-paper-2 text-brand-ink",
                  !done && !current && "border-2 border-line-2 text-ink-4"
                )}
              >
                {done ? <AppIcon name="check" size={15} /> : i + 1}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "my-[5px] min-h-6 w-0.5 flex-1 rounded-sm transition-colors",
                    done ? "bg-primary" : "bg-line-2"
                  )}
                />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-6 pt-[5px]">
              <div
                className={cn(
                  "whitespace-nowrap text-sm tracking-tight",
                  current && "font-semibold text-ink",
                  done && "font-semibold text-ink-2",
                  !done && !current && "font-medium text-ink-4"
                )}
              >
                {s.label}
              </div>
              <div className="mt-[3px] text-xs text-ink-4">{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface OnboardingFrameProps {
  /** Active index within the four-step setup stepper (0–3). */
  stepIndex: number;
  title: string;
  sub?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  canNext?: boolean;
  footerNote?: string;
  hideBack?: boolean;
}

/**
 * Two-pane onboarding shell: a setup rail with the vertical stepper on the
 * left and scrollable step content with a sticky back/continue footer on the
 * right. The rail collapses to a slim top progress bar below lg.
 */
export function OnboardingFrame({
  stepIndex,
  title,
  sub,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  canNext = true,
  footerNote,
  hideBack,
}: OnboardingFrameProps) {
  const activeStep = SETUP_STEPS[stepIndex];

  return (
    <div className="flex h-full w-full bg-ivory">
      {/* LEFT rail (lg+) */}
      <aside className="hidden w-[312px] flex-none flex-col border-r border-line bg-cream px-8 py-[34px] lg:flex">
        <AppLogo size="md" />
        <div className="mt-11">
          <SectionLabel className="mb-1.5">Setup</SectionLabel>
          <h2 className="mb-7 text-[21px] font-bold tracking-tight text-ink">
            Build your brain
          </h2>
          <Stepper active={stepIndex} />
        </div>
        <div className="mt-auto flex items-center gap-2.5 rounded-xl border border-line bg-paper p-3">
          <span className="grid size-[30px] flex-none place-items-center rounded-lg bg-cream text-brand-ink">
            <AppIcon name="help" size={17} />
          </span>
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold text-ink">
              Need a hand?
            </div>
            <div className="text-[11.5px] text-ink-3">Takes about 2 minutes</div>
          </div>
        </div>
      </aside>

      {/* RIGHT content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile progress bar */}
        <div className="flex items-center gap-3 border-b border-line bg-cream px-5 py-3 lg:hidden">
          <AppLogo size="sm" />
          <span className="ml-auto text-xs font-medium text-ink-3">
            Step {stepIndex + 1} of {SETUP_STEPS.length} · {activeStep.label}
          </span>
        </div>

        <div className="scroll-y flex-1 px-6 md:px-12">
          <div className="mx-auto max-w-[760px] pb-10 pt-10 md:pt-14">
            <div className="motion-safe:animate-fade-up">
              <h1 className="text-[28px] font-bold tracking-tight text-ink md:text-[34px]">
                {title}
              </h1>
              {sub && (
                <p className="mt-3 max-w-[540px] text-[15px] leading-[1.5] text-ink-3 md:text-base">
                  {sub}
                </p>
              )}
            </div>
            <div className="mt-7 motion-safe:animate-fade-up">{children}</div>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center border-t border-line-soft bg-ivory/90 px-6 py-4 md:px-12">
          {!hideBack && (
            <Button variant="ghost" onClick={onBack}>
              <AppIcon name="arrowLeft" /> Back
            </Button>
          )}
          <div className="ml-auto flex items-center gap-[18px]">
            {footerNote && (
              <span className="text-[13px] font-medium text-ink-4">
                {footerNote}
              </span>
            )}
            <Button onClick={onNext} disabled={!canNext}>
              {nextLabel}
              <AppIcon name="arrow" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
