import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useBrainBuild } from "@/features/onboarding/hooks/useBrainBuild";
import { BrainCore } from "@/features/onboarding/components/build/BrainCore";
import { BrainField } from "@/features/onboarding/components/build/BrainField";
import { LedgerStat } from "@/features/onboarding/components/build/LedgerStat";
import { useStageScale } from "@/features/onboarding/components/build/useStageScale";
import { BUILD_TOTAL_MS, LEDGER } from "@/features/onboarding/components/build/scene";

/**
 * Build-brain cinematic scene (Phase 3). Orbiting source nodes feed energy
 * comets into a glass brain core while decision cards bloom and the ledger
 * counts up; the scene resolves to a "brain ready" finale that advances to
 * the first question. Continuous motion is CSS-driven; only phase copy,
 * ledger count-ups, and the finale are timed in `useBrainBuild`.
 */
export function StepBuild({ onComplete }: { onComplete: () => void }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const scale = useStageScale();
  const { phaseLabel, phaseLine, runSources, runDecisions, runPolicies, done } =
    useBrainBuild(reduced);

  return (
    <div className="bb-stage">
      <div className="bb-dotgrid" />
      <div className="bb-vignette" />

      {/* fixed scene canvas, scaled to fit the viewport */}
      <div className="bb-field" style={{ transform: `translate(-50%,-50%) scale(${scale})` }}>
        <BrainField reduced={reduced} />
        <BrainCore done={done} />
      </div>

      {/* completion bloom flash */}
      {done && !reduced && <div className="bb-flash" />}

      {/* heading */}
      <div className="absolute inset-x-0 top-12 z-20 px-6 text-center md:top-16">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">
          {done ? "Brain online" : phaseLabel}
        </div>
        <h1
          className="mt-4 text-[34px] font-bold tracking-tight text-white md:text-[52px]"
          style={{ textShadow: "0 2px 30px rgba(120,28,2,0.4)" }}
        >
          {done ? (
            <>
              Your brain is{" "}
              <span className="font-serif font-normal italic">ready.</span>
            </>
          ) : (
            "Building your brain"
          )}
        </h1>
        <p className="mx-auto mt-3 min-h-6 max-w-[520px] text-[15px] text-white/85 md:text-[17px]">
          {done
            ? `${LEDGER.decisions} decisions · ${LEDGER.policies} policies · ${LEDGER.skills} skills extracted`
            : phaseLine}
        </p>
      </div>

      {/* ledger */}
      <div className="absolute inset-x-0 bottom-24 z-20 flex flex-wrap justify-center gap-x-10 gap-y-6 px-6 md:gap-x-20">
        <LedgerStat label="Sources read" target={LEDGER.sources} run={!reduced && runSources} />
        <LedgerStat label="Decisions" target={LEDGER.decisions} run={!reduced && runDecisions} />
        <LedgerStat label="Policies" target={LEDGER.policies} run={!reduced && runPolicies} />
        <LedgerStat label="Skills" target={LEDGER.skills} run={!reduced && runPolicies} />
      </div>

      {/* footer: progress + control */}
      <div className="absolute inset-x-0 bottom-7 z-30 flex items-center gap-4 px-6 md:gap-5 md:px-11">
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white"
            style={{
              width: done ? "100%" : 0,
              boxShadow: "0 0 12px rgba(255,255,255,0.7)",
              animation: done || reduced ? "none" : `bb-prog-fill ${BUILD_TOTAL_MS}ms linear forwards`,
            }}
          />
        </div>
        {done ? (
          <Button
            onClick={onComplete}
            className="flex-none bg-white font-bold text-brand-ink hover:bg-white/90"
          >
            Ask your brain
            <AppIcon name="arrow" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={onComplete}
            className="flex-none text-white/85 hover:bg-white/10 hover:text-white"
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
