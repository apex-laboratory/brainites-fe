import { AppIcon, EmptyState, ErrorState, Skeleton } from "@/components/shared";
import { SourceIcon } from "@/components/shared/SourceIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSources } from "@/features/sources";
import { ManageSourceDialog } from "@/features/sources/components";
import { OnboardingFrame } from "@/features/onboarding/components/OnboardingFrame";

export interface StepConfigureProps {
  onBack: () => void;
  onNext: () => void;
}

/**
 * Configure step: scope each *real* connected source — which channels / pages /
 * repos it reads and how far back — via the same {@link ManageSourceDialog} the
 * Sources page uses (`GET`/`PATCH /sources/{id}/channels`). Scoping is optional;
 * "Build my brain" advances regardless.
 */
export function StepConfigure({ onBack, onNext }: StepConfigureProps) {
  const { sources, isPending, isError, error, refetch } = useSources();

  return (
    <OnboardingFrame
      stepIndex={2}
      title="Choose what the brain should read"
      sub="Scope each source to what matters. Start narrow — you can widen anytime."
      onBack={onBack}
      onNext={onNext}
      canNext
      nextLabel="Build my brain"
    >
      {isPending ? (
        <div className="flex flex-col gap-3.5">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-[76px] rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          title="Couldn't load your sources"
        />
      ) : sources.length === 0 ? (
        <EmptyState
          icon="sources"
          title="No sources connected yet"
          sub="Go back to connect a source, or skip — you can scope what your brain reads any time from Sources."
        />
      ) : (
        <div className="flex flex-col gap-3.5">
          {sources.map(({ source, meta }) => (
            <Card key={source.id} className="flex items-center gap-3.5 p-[18px] px-[22px]">
              <SourceIcon id={source.provider} size={22} branded />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold tracking-tight text-ink">
                  {meta.name}
                </div>
                <div className="mt-px text-[12.5px] text-ink-3">{meta.tag}</div>
              </div>
              <ManageSourceDialog
                source={source}
                meta={meta}
                trigger={
                  <Button variant="outline" size="sm">
                    <AppIcon name="settings" size={14} />
                    Scope
                  </Button>
                }
              />
            </Card>
          ))}
        </div>
      )}
    </OnboardingFrame>
  );
}
