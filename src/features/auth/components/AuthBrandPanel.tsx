import { AppLogo } from "@/components/shared/AppLogo";

import dexterLab from "@/assets/dexter_lab.png";

/** Left brand panel: the full lab "secret access" scene shown edge-to-edge
 * and uncropped at the top, with the product line and Brainite mark below on
 * the navy surface. Hidden below lg, where the form fills the full width. */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-[56%] flex-none flex-col overflow-hidden bg-[#081124] text-white lg:flex">
      {/* full lab scene, uncropped, edge-to-edge */}
      <img
        src={dexterLab}
        alt="A scientist stepping into a glowing secret laboratory"
        className="w-full select-none object-cover"
        draggable={false}
      />

      {/* copy + brand mark */}
      <div className="flex flex-1 flex-col justify-end p-11">
        <h1 className="text-[44px] font-bold leading-[1.04] tracking-tight">
          The answer was always{" "}
          <span className="font-serif text-[1.04em] font-normal italic text-brand">
            inside.
          </span>
        </h1>
        <p className="mt-4 text-[18px] leading-[1.5] text-white/60">
          We help AI agents find it.
        </p>

        <div className="mt-12">
          <AppLogo size="lg" onDark />
        </div>
      </div>
    </div>
  );
}
