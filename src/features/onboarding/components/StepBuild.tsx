import { useEffect } from "react";

import { AppIcon } from "@/components/shared/AppIcon";
import { SourceIcon } from "@/components/shared/SourceIcon";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Button } from "@/components/ui/button";
import { SOURCE_ORDER } from "@/constants/sources";
import { BRAND } from "@/constants/brand";

const BUILD_MS = 2800;

/**
 * Build-brain step — Phase 2 placeholder.
 *
 * TODO(phase-3): Replace this with the full cinematic build scene
 * (orbiting source nodes, comet connection lines, floating extracted
 * decision cards, ledger metrics, phased progress) per the guide's
 * "Build Brain" reference. For now it shows a calm progress state and
 * auto-advances to the first question so the flow stays clickable.
 */
export function StepBuild({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onComplete, BUILD_MS);
    return () => window.clearTimeout(id);
  }, [onComplete]);

  return (
    <div
      className="relative grid min-h-full place-items-center bg-ivory"
      style={{
        background:
          "radial-gradient(circle at 50% 42%, var(--accent-soft), var(--ivory) 60%)",
      }}
    >
      <div className="w-[560px] max-w-[92%] px-6 text-center">
        <div className="mx-auto mb-10 grid size-24 place-items-center">
          <span
            className="grid size-24 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft-3 motion-safe:animate-[core-pulse_3s_var(--ease-in-out)_infinite]"
            style={{ transform: "translate(0, 0)" }}
          >
            <AppIcon name="brain" size={42} />
          </span>
        </div>

        <SectionLabel className="motion-safe:animate-fade-up">
          Building your brain
        </SectionLabel>
        <h1 className="mt-3 text-[32px] font-bold tracking-tight text-ink">
          Extracting {BRAND.workspace}&apos;s decisions
        </h1>
        <p className="mx-auto mt-3 max-w-[420px] text-[15px] text-ink-3">
          {BRAND.name} is reading your connected sources and turning decisions
          into versioned skills.
        </p>

        <div className="mx-auto mt-8 flex max-w-[280px] items-center justify-center gap-3">
          {SOURCE_ORDER.map((id) => (
            <SourceIcon key={id} id={id} size={22} branded />
          ))}
        </div>

        <div className="mx-auto mt-8 h-1.5 w-full max-w-[420px] overflow-hidden rounded-full bg-cream">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: "100%", animation: `bar-grow ${BUILD_MS}ms var(--ease) both` }}
          />
        </div>

        <div className="mt-8">
          <Button variant="ghost" onClick={onComplete}>
            Skip to your first question
            <AppIcon name="arrow" />
          </Button>
        </div>
      </div>
    </div>
  );
}
