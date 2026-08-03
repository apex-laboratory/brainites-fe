import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/constants/brand";
import { OnboardingShell } from "@/features/onboarding/components/OnboardingShell";
import { SETUP_STEPS } from "@/features/onboarding/data/onboarding-fixtures";
import dexterFinish from "@/assets/dexter_finish.png";

export interface StepReadyProps {
  onNext: () => void;
}

/**
 * Final onboarding screen: a full-bleed celebratory image fills the content
 * column (everything but the rail) with the confirmation copy and the CTA
 * into the dashboard overlaid. Replaces the former first-question step.
 */
export function StepReady({ onNext }: StepReadyProps) {
  return (
    <OnboardingShell stepIndex={SETUP_STEPS.length} bleed>
      <div className="relative h-full min-h-[420px] w-full overflow-hidden bg-ink">
        <img
          src={dexterFinish}
          alt="Brainite is online and ready"
          className="absolute inset-0 h-full w-full select-none object-cover"
          draggable={false}
        />
        {/* legibility scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

        <div className="absolute inset-x-0 bottom-0 p-7 md:p-14">
          <div className="max-w-[560px] motion-safe:animate-fade-up">
            <h1 className="text-[30px] font-bold leading-[1.08] tracking-tight text-white md:text-[44px]">
              All set! Your brain is ready.
            </h1>
            <p className="mt-3.5 max-w-[440px] text-[15.5px] leading-[1.5] text-white/85 md:text-[18px]">
              {BRAND.name} is now learning from your tools and will get smarter
              every day.
            </p>
            <Button size="lg" className="mt-7" onClick={onNext}>
              Connect your agents
              <AppIcon name="arrow" />
            </Button>
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}
