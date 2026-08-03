import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { AppIcon } from "@/components/shared/AppIcon";
import { Spinner } from "@/components/shared/QueryState";
import { SourceIcon } from "@/components/shared/SourceIcon";
import { Button } from "@/components/ui/button";
import { SOURCES } from "@/constants/sources";
import { isApiError } from "@/lib/api";
import type { SourceId } from "@/types/common";
import { cn } from "@/utils/cn";
import { useSources } from "@/features/sources";
import { OnboardingShell } from "@/features/onboarding/components/OnboardingShell";
import { SweepProgressList } from "@/features/onboarding/components/SweepProgressList";
import { useOnboardingSweep } from "@/features/onboarding/hooks/useOnboardingSweep";
import dexterOnline from "@/assets/dexter_online.png";

/** Linger on the finished state before advancing to the "all set" screen. */
const FINISH_HOLD_MS = 700;

export interface StepLearningProps {
  onComplete: () => void;
}

/**
 * "Build the brain" step. Connecting a source registers the connection but
 * ingests nothing — historical backfill happens only in this sweep — so this
 * screen is where a workspace actually gets its knowledge.
 *
 * It is a small state machine rather than a timed animation:
 *
 *  - `idle` — the pre-sweep checklist and an explicit **Build my brain** CTA,
 *    disabled until at least one source is connected. Nothing fires on mount.
 *  - `ingesting` / `extracting` — live per-provider progress. Ingestion finishing
 *    is *not* the end: extraction is queued afterwards, so we hold here until the
 *    skill counts settle rather than dropping the user into an empty queue.
 *  - `timedOut` — 15 minutes in, we stop polling and say so; large workspaces can
 *    legitimately take longer than any timeout worth waiting on screen.
 *  - `forbidden` — the sweep is admin-only; a viewer or editor is told plainly
 *    instead of being shown a CTA that can only 403.
 */
export function StepLearning({ onComplete }: StepLearningProps) {
  const { role } = useAuth();
  const { sources, isPending: sourcesPending } = useSources();
  const { phase, sweep, providers, failures, start, retry, error } =
    useOnboardingSweep();

  // Hide the CTA only when we positively know the user isn't an admin. Right
  // after `POST /workspaces` the session carries no role yet (it resolves on the
  // next `/auth/me`), and that user *is* the workspace admin — gating on a
  // strict `=== "admin"` would lock the creator out of their own build. A real
  // non-admin still can't run one: the 403 lands us in `forbidden`.
  const knownNonAdmin = role !== null && role !== "admin";

  const connectedCount = sources.length;
  const canStart = connectedCount > 0;

  useEffect(() => {
    if (phase !== "done") return;
    const timer = setTimeout(onComplete, FINISH_HOLD_MS);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  const skillsCreated = sweep?.skillsCreated ?? 0;
  const skillsQueued = sweep?.skillsQueued ?? 0;

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

        <div className="absolute inset-x-0 bottom-0 p-7 md:p-14">
          <div className="max-w-[540px] motion-safe:animate-fade-up">
            {knownNonAdmin ? (
              <Frame
                title="Building the brain needs an admin"
                sub="Your role can't start or watch the onboarding sweep. Ask a workspace admin to run it — you can carry on, and your brain will be ready once they have."
              >
                <Continue onClick={onComplete} label="Continue" />
              </Frame>
            ) : phase === "forbidden" ? (
              <Frame
                title="You don't have permission to build the brain"
                sub="Starting the onboarding sweep is restricted to workspace admins. Ask an admin to run it, then come back."
              >
                <Continue onClick={onComplete} label="Continue" />
              </Frame>
            ) : phase === "error" ? (
              <Frame
                title="Couldn't start the build"
                sub={
                  isApiError(error)
                    ? error.message
                    : "Something went wrong starting the onboarding sweep."
                }
              >
                <div className="flex items-center gap-2.5">
                  <Button variant="solid" onClick={retry}>
                    <AppIcon name="refresh" size={15} />
                    Try again
                  </Button>
                  <Continue onClick={onComplete} label="Skip for now" ghost />
                </div>
                {isApiError(error) && error.requestId && (
                  <p className="mt-3 text-[12px] text-white/50">
                    Reference: {error.requestId}
                  </p>
                )}
              </Frame>
            ) : phase === "timedOut" ? (
              <Frame
                title="Still working. Check back later."
                sub="This build is taking longer than usual — large workspaces can run well past fifteen minutes. It keeps running on our side; you can carry on and check the review queue later."
              >
                <SweepProgressList entries={providers} />
                <div className="mt-4">
                  <Continue onClick={onComplete} label="Continue" />
                </div>
              </Frame>
            ) : phase === "idle" || phase === "starting" ? (
              <Frame
                title="Build your brain"
                sub="Connecting a source doesn't read anything historical. This first sweep is what backfills your decisions, policies and runbooks."
              >
                <PreflightChecklist
                  sources={sources.map((entry) => entry.source.provider)}
                  isPending={sourcesPending}
                />
                <div className="mt-4 flex items-center gap-3">
                  <Button
                    variant="solid"
                    onClick={start}
                    disabled={!canStart || phase === "starting"}
                  >
                    {phase === "starting" ? (
                      <>
                        <Spinner size={15} tone="light" />
                        Starting…
                      </>
                    ) : (
                      <>
                        <AppIcon name="sparkles" size={15} />
                        Build my brain
                      </>
                    )}
                  </Button>
                  {!canStart && !sourcesPending && (
                    <span className="text-[13px] text-white/70">
                      Connect at least one source first.
                    </span>
                  )}
                </div>
              </Frame>
            ) : (
              <Frame
                title="Building your brain"
                sub="Brainite is reading your connected tools and extracting decisions."
              >
                {providers.length > 0 ? (
                  <SweepProgressList entries={providers} />
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/15 px-4 py-3">
                    <Spinner size={17} tone="light" />
                    <span className="text-[13.5px] text-white/80">
                      Queuing your sources…
                    </span>
                  </div>
                )}

                {phase === "extracting" && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3">
                    <Spinner size={17} tone="light" />
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-white">
                        Ingesting complete — extracting knowledge…
                      </div>
                      <div className="mt-px text-[12.5px] text-white/65">
                        {skillsCreated} skill{skillsCreated === 1 ? "" : "s"} created
                        {skillsQueued > 0 && `, ${skillsQueued} queued`}
                      </div>
                    </div>
                  </div>
                )}

                {failures.length > 0 && (
                  <p className="mt-3 text-[12.5px] text-amber">
                    {failures.length} source{failures.length === 1 ? "" : "s"}{" "}
                    couldn't be read. You can reconnect{" "}
                    {failures.length === 1 ? "it" : "them"} from Sources at any
                    time — the rest of your brain is unaffected.
                  </p>
                )}
              </Frame>
            )}
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}

/** Shared title/sub/body layout for every phase of this screen. */
function Frame({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <>
      <h1 className="font-display text-[34px] font-normal leading-[1.05] tracking-[0.015em] text-white md:text-[43px]">
        {title}
      </h1>
      <p className="mt-2.5 max-w-[460px] text-[15px] leading-[1.5] text-white/85 md:text-base">
        {sub}
      </p>
      <div className="mt-6">{children}</div>
    </>
  );
}

function Continue({
  onClick,
  label,
  ghost,
}: {
  onClick: () => void;
  label: string;
  ghost?: boolean;
}) {
  return (
    <Button variant={ghost ? "ghost" : "solid"} onClick={onClick}>
      {label}
      <AppIcon name="arrow" />
    </Button>
  );
}

/**
 * What the sweep is about to read. `GET /sources` is the only honest answer —
 * the sweep backfills every connected source, with no per-source selection.
 */
function PreflightChecklist({
  sources,
  isPending,
}: {
  sources: SourceId[];
  isPending: boolean;
}) {
  if (isPending) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3">
        <Spinner size={17} tone="light" />
        <span className="text-[13.5px] text-white/80">
          Checking what's connected…
        </span>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3">
        <AppIcon name="warning" size={17} className="text-amber" />
        <span className="text-[13.5px] text-white/80">
          No sources connected — go back and connect one so your brain has
          something to read.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3.5">
      <div className="text-[12.5px] font-semibold uppercase tracking-wide text-white/60">
        Will read from
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {sources.map((provider) => (
          <span
            key={provider}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-white/15",
              "bg-white/10 px-2.5 py-1.5 text-[13px] font-medium text-white",
            )}
          >
            <SourceIcon id={provider} size={15} />
            {SOURCES[provider].name}
          </span>
        ))}
      </div>
    </div>
  );
}
