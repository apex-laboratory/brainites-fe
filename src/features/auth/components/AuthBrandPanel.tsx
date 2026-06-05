import { AppLogo } from "@/components/shared/AppLogo";
import { NiceAvatar } from "@/components/shared/NiceAvatar";
import { SourceIcon } from "@/components/shared/SourceIcon";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { SOURCE_ORDER } from "@/constants/sources";
import { BRAND } from "@/constants/brand";
import { AUTH_TESTIMONIAL } from "@/features/auth/data/auth-fixtures";
import { AuthOrbit } from "@/features/auth/components/AuthOrbit";

/** Left brand panel: dark warm surface, living source constellation,
 * product narrative and a testimonial. Hidden below the lg breakpoint. */
export function AuthBrandPanel() {
  return (
    <div
      className="relative hidden w-1/2 flex-none flex-col overflow-hidden p-11 text-white lg:flex"
      style={{
        background:
          "linear-gradient(155deg, #2A2620 0%, #1A1610 55%, #100D08 100%)",
      }}
    >
      <AuthOrbit />

      {/* readability scrim over the constellation */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(100deg, rgba(20,17,11,0.97) 0%, rgba(20,17,11,0.84) 32%, rgba(20,17,11,0.12) 68%, transparent 100%)",
        }}
      />

      <div className="relative z-[2]">
        <AppLogo size="lg" onDark />
      </div>

      <div className="relative z-[2] my-auto max-w-[480px]">
        <SectionLabel className="mb-[18px] text-white/50">
          The company brain
        </SectionLabel>
        <h1 className="text-[50px] font-bold leading-[1.02] text-white">
          Every company already knows{" "}
          <span className="font-normal text-[#FFD9C6]">how it works.</span>
        </h1>
        <p className="mt-5 max-w-[420px] text-[18px] leading-[1.55] text-white/[0.66]">
          {BRAND.name} reads the decisions buried in your tools and turns them
          into versioned skills your agents can call.
        </p>
      </div>

      {/* testimonial */}
      <div className="relative z-[2] max-w-[460px] rounded-2xl border border-white/[0.09] bg-white/5 p-5 backdrop-blur-sm">
        <p className="text-[15px] leading-[1.5] text-white/90">
          &ldquo;{AUTH_TESTIMONIAL.quote}&rdquo;
        </p>
        <div className="mt-3.5 flex items-center gap-2.5">
          <NiceAvatar name={AUTH_TESTIMONIAL.name} size={32} />
          <div>
            <div className="text-[13.5px] font-semibold">
              {AUTH_TESTIMONIAL.name}
            </div>
            <div className="text-xs text-white/50">{AUTH_TESTIMONIAL.role}</div>
          </div>
          <div className="ml-auto flex gap-2.5 opacity-70">
            {SOURCE_ORDER.map((id) => (
              <SourceIcon key={id} id={id} size={17} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
