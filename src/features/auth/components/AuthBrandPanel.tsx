import { AppLogo } from "@/components/shared/AppLogo";

import dexterLab from "@/assets/dexter_lab.png";

/** Left brand panel: the lab "secret access" scene spans the whole panel
 * edge-to-edge, with the product line and Brainite mark overlaid on top.
 * Hidden below lg, where the form fills the full width. */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-[62%] flex-none flex-col overflow-hidden bg-[#081124] text-white lg:flex">
      {/* full lab scene, spanning the whole panel */}
      <img
        src={dexterLab}
        alt="A scientist stepping into a glowing secret laboratory"
        className="absolute inset-0 h-full w-full select-none object-cover object-center"
        draggable={false}
      />
      {/* legibility scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />

      {/* copy + brand mark, overlaid */}
      <div className="relative mt-auto p-11">
        <h1 className="text-[44px] font-bold leading-[1.04] tracking-tight">
          The answer was always{" "}
          <span className="font-serif text-[1.04em] font-normal italic text-brand">
            inside.
          </span>
        </h1>
        <p className="mt-4 text-[18px] leading-[1.5] text-white/70">
          We help AI agents find it.
        </p>

        <div className="mt-12">
          <AppLogo size="lg" onDark flush />
        </div>
      </div>
    </div>
  );
}
