import { cn } from "@/utils/cn";
import { AppIcon, ErrorState, Skeleton } from "@/components/shared";
import { SourceIcon } from "@/components/shared/SourceIcon";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SOURCES, SOURCE_ORDER } from "@/constants/sources";
import { BRAND } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import type { SourceId } from "@/types/common";
import { useSources } from "@/features/sources";
import { AddSourceDialog } from "@/features/sources/components";
import { OnboardingFrame } from "@/features/onboarding/components/OnboardingFrame";

export interface StepConnectProps {
  onBack: () => void;
  onNext: () => void;
}

/**
 * Connect step: shows the workspace's *real* connected sources (`GET /sources`)
 * and hands off to the real provider OAuth via {@link AddSourceDialog}.
 *
 * Connecting is a full-page redirect to the provider; the backend finishes the
 * exchange and (via `returnTo`) lands the browser back on `/onboarding`, where
 * `OnboardingPage` restores this step and acknowledges the outcome. Per
 * connect-later, this step is skippable ("Continue"/"Skip for now") and sources
 * can also be connected any time from Sources.
 */
export function StepConnect({ onBack, onNext }: StepConnectProps) {
  const { sources, isPending, isError, error, refetch } = useSources();

  const connectedProviders = new Set<SourceId>(
    sources.map((entry) => entry.source.provider),
  );
  const connectedCount = connectedProviders.size;
  const total = SOURCE_ORDER.length;

  const addSourceTrigger = (
    <AddSourceDialog
      connected={[...connectedProviders]}
      returnTo={ROUTES.onboarding}
      trigger={
        <Button size="sm" className="ml-auto">
          <AppIcon name="link" size={15} />
          {connectedCount ? "Connect another" : "Connect a source"}
        </Button>
      }
    />
  );

  return (
    <OnboardingFrame
      stepIndex={1}
      title="Plug in where your decisions already live"
      sub={`Read-only. ${BRAND.name} never writes back to your tools.`}
      onBack={onBack}
      onNext={onNext}
      canNext
      footerNote={`${connectedCount} of ${total} connected`}
      nextLabel={connectedCount ? "Continue" : "Skip for now"}
    >
      {isError ? (
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          title="Couldn't load your sources"
        />
      ) : (
        <>
          {/* summary bar */}
          <Card className="mb-3.5 flex items-center gap-4 p-4 px-5">
            <div className="flex">
              {SOURCE_ORDER.map((id, i) => {
                const on = connectedProviders.has(id);
                return (
                  <span
                    key={id}
                    className={cn(
                      "grid size-[34px] place-items-center rounded-[9px] border-2 border-paper transition-all",
                      on ? "bg-paper-2 opacity-100" : "bg-cream opacity-50 grayscale",
                      i > 0 && "-ml-2.5",
                    )}
                  >
                    <SourceIcon id={id} size={19} branded={on} />
                  </span>
                );
              })}
            </div>
            <div className="min-w-0 flex-1">
              <div className="whitespace-nowrap text-[15px] font-bold tracking-tight text-ink">
                {connectedCount === 0
                  ? "No sources connected yet"
                  : `${connectedCount} of ${total} sources connected`}
              </div>
              <div className="mt-0.5 whitespace-nowrap text-[13px] text-ink-3">
                {connectedCount === 0
                  ? "Connect at least one so your brain has something to read"
                  : "You can scope what each reads on the next step"}
              </div>
            </div>
            {addSourceTrigger}
          </Card>

          {/* source cards */}
          {isPending ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-[104px] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {SOURCE_ORDER.map((id) => {
                const source = SOURCES[id];
                const connected = connectedProviders.has(id);
                return (
                  <Card
                    key={id}
                    className={cn(
                      "flex items-center gap-3 p-5 transition-all",
                      connected ? "border-green/45" : "border-line-2 opacity-80",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-[46px] flex-none place-items-center rounded-xl transition-colors",
                        connected ? "bg-green-soft" : "bg-cream",
                      )}
                    >
                      <SourceIcon id={id} size={27} branded={connected} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-bold tracking-tight text-ink">
                        {source.name}
                      </div>
                      <div className="mt-px text-[12.5px] text-ink-3">
                        {source.tag}
                      </div>
                    </div>
                    {connected ? (
                      <StatusIndicator
                        tone="live"
                        label={`${source.name} connected`}
                        pulse
                      />
                    ) : (
                      <Badge variant="outline" className="border-dashed text-ink-4">
                        Not connected
                      </Badge>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </OnboardingFrame>
  );
}
