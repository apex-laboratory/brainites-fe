import { AppLogo } from "@/components/shared/AppLogo";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/constants/brand";
import dexterData from "@/assets/dexter_data.png";

/** Onboarding welcome: full-bleed hero with the brand intro and CTA. */
export function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative h-full min-h-[100svh] w-full overflow-hidden bg-ink">
      <img
        src={dexterData}
        alt="Brainite analyzing your company data"
        className="absolute inset-0 h-full w-full select-none object-cover"
        draggable={false}
      />
      {/* legibility scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />

      {/* logo */}
      <div className="absolute left-0 top-0 p-7 md:p-10">
        <AppLogo size="xl" onDark />
      </div>

      {/* content */}
      <div className="absolute inset-x-0 bottom-0 p-7 md:p-14">
        <div className="max-w-[640px] motion-safe:animate-fade-up">
          <h1 className="font-logo text-[44px] font-normal leading-[1.02] text-white md:text-[68px]">
            Welcome to {BRAND.onboardingName}
            <span className="text-[#C2410C]">.</span>
          </h1>
          <p className="mt-4 text-[17px] leading-[1.5] text-white/85 md:text-[21px]">
            Let&apos;s build your team&apos;s superpowered{" "}
            <span className="font-semibold" style={{ color: "#FF9356" }}>
              knowledge base
            </span>
            .
          </p>
          <Button size="lg" className="mt-8" onClick={onNext}>
            Get started
            <AppIcon name="arrow" />
          </Button>
        </div>
      </div>
    </div>
  );
}
