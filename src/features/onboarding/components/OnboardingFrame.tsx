import type { ReactNode } from "react";

import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/features/onboarding/components/OnboardingShell";

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
 * Standard onboarding form step: a left-aligned title/sub and step content
 * inside the shared {@link OnboardingShell}, with a back/continue footer.
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
  return (
    <OnboardingShell
      stepIndex={stepIndex}
      footer={
        <>
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
        </>
      }
    >
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
    </OnboardingShell>
  );
}
