import { useEffect } from "react";

import { cn } from "@/utils/cn";
import { AppIcon } from "@/components/shared/AppIcon";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { OnboardingShell } from "@/features/onboarding/components/OnboardingShell";
import { useBrainBuild } from "@/features/onboarding/hooks/useBrainBuild";
import { useLearningProgress } from "@/features/onboarding/hooks/useLearningProgress";
import { LEARNING_STEPS } from "@/features/onboarding/data/onboarding-fixtures";
import dexterOnline from "@/assets/dexter_online.png";

/** Small spinner for the in-progress checklist item (no inline SVG). */
function Spinner() {
  return (
    <span
      aria-hidden
      className="block size-[18px] rounded-full border-2 border-white/30 border-t-white motion-safe:animate-spin"
    />
  );
}

/** Linger on the finished state before advancing to the "all set" screen. */
const FINISH_HOLD_MS = 700;

export interface StepLearningProps {
  onComplete: () => void;
}

/**
 * "Building your brain" step: fires a real onboarding sweep (`POST /sweeps`) and
 * polls it to completion via {@link useBrainBuild}, while the checklist animates
 * over a full-bleed image. The final checklist item — and the auto-advance — are
 * gated on the *real* sweep reaching a terminal state (or failing to start, e.g.
 * no sources connected yet), not on a timer.
 */
export function StepLearning({ onComplete }: StepLearningProps) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { completed } = useLearningProgress(LEARNING_STEPS.length, reduced);
  const { done: sweepDone, failed } = useBrainBuild();

  // The build is over once the real sweep is terminal, or couldn't start at all.
  const buildDone = sweepDone || failed;
  const total = LEARNING_STEPS.length;
  // Hold the last checklist item until the real sweep actually finishes.
  const effectiveCompleted = buildDone ? total : Math.min(completed, total - 1);
  const done = buildDone && effectiveCompleted >= total;

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(onComplete, FINISH_HOLD_MS);
    return () => clearTimeout(timer);
  }, [done, onComplete]);

  return (
    <OnboardingShell stepIndex={3} bleed>
      <div className="relative h-full min-h-[460px] w-full overflow-hidden bg-ink">
        <img
          src={dexterOnline}
          alt="Brainite learning from your connected tools"
          className="absolute inset-0 h-full w-full select-none object-cover"
          draggable={false}
        />
        {/* legibility scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/30" />

        <button
          type="button"
          onClick={onComplete}
          className="absolute right-5 top-4 z-10 rounded-md px-2 py-1 text-[13px] font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Skip for now
        </button>

        {/* sequence overlaid on the image */}
        <div className="absolute inset-x-0 bottom-0 p-7 md:p-14">
          <div className="max-w-[520px] motion-safe:animate-fade-up">
            <h1 className="text-[28px] font-bold tracking-tight text-white md:text-[36px]">
              Building your brain
            </h1>
            <p className="mt-2.5 max-w-[440px] text-[15px] leading-[1.5] text-white/85 md:text-base">
              Brainite is reading your connected tools and extracting decisions.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              {LEARNING_STEPS.map((item, i) => {
                const isDone = i < effectiveCompleted;
                const isActive = i === effectiveCompleted && !done;
                return (
                  <div
                    key={item.t}
                    className={cn(
                      "flex items-center gap-3.5 rounded-xl border px-4 py-3 backdrop-blur-sm transition-colors",
                      isActive
                        ? "border-white/25 bg-white/15"
                        : "border-white/10 bg-white/10"
                    )}
                  >
                    <span className="grid size-[18px] flex-none place-items-center">
                      {isDone ? (
                        <AppIcon
                          name="checkCircle"
                          size={20}
                          className="text-green-300"
                        />
                      ) : isActive ? (
                        <Spinner />
                      ) : (
                        <span className="block size-[14px] rounded-full border-2 border-white/30" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "text-[14.5px] font-semibold tracking-tight",
                          isDone || isActive ? "text-white" : "text-white/55"
                        )}
                      >
                        {item.t}
                      </div>
                      <div className="mt-px text-[12.5px] text-white/65">
                        {item.d}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}
