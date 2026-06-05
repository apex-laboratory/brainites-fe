import { cn } from "@/utils/cn";
import { AppIcon } from "@/components/shared/AppIcon";
import { SourceIcon } from "@/components/shared/SourceIcon";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SOURCES, SOURCE_ORDER } from "@/constants/sources";
import { BRAND } from "@/constants/brand";
import type { SourceId } from "@/types/common";
import { SOURCE_CONNECT_META } from "@/features/onboarding/data/onboarding-fixtures";
import { OnboardingFrame } from "@/features/onboarding/components/OnboardingFrame";
import type { ConnectionStatus } from "@/features/onboarding/types";
import type { useSourceConnections } from "@/features/onboarding/hooks";

interface ConnectCardProps {
  id: SourceId;
  status: ConnectionStatus;
  onConnect: () => void;
}

function ConnectCard({ id, status, onConnect }: ConnectCardProps) {
  const source = SOURCES[id];
  const meta = SOURCE_CONNECT_META[id];
  const connected = status === "connected";
  const connecting = status === "connecting";

  return (
    <Card
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden p-5 transition-all",
        connected && "-translate-y-0.5 border-green/45 shadow-soft-2"
      )}
    >
      {connecting && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 motion-safe:animate-[connect-scan_1.1s_var(--ease)_infinite]"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--accent-glow), transparent)",
          }}
        />
      )}

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-[46px] flex-none place-items-center rounded-xl transition-colors",
            connected ? "bg-green-soft" : "bg-cream"
          )}
        >
          <SourceIcon id={id} size={27} branded />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold tracking-tight text-ink">
            {source.name}
          </div>
          <div className="mt-px text-[12.5px] text-ink-3">{meta.tag}</div>
        </div>
        {connected && (
          <StatusIndicator
            tone="live"
            label={`${source.name} connected`}
            pulse
          />
        )}
      </div>

      <div className="flex items-baseline">
        <span className="tnum mr-2 text-[25px] font-semibold tracking-tight text-ink">
          {meta.count}
        </span>
        <span className="whitespace-nowrap text-[13px] text-ink-3">
          {meta.unit}
        </span>
      </div>

      <div className="flex min-h-[26px] flex-wrap gap-1.5">
        {meta.reads.map((r) => (
          <Badge key={r} variant="outline" className="font-medium">
            {r}
          </Badge>
        ))}
        {meta.extra > 0 && (
          <Badge variant="outline" className="border-dashed text-ink-4">
            +{meta.extra}
          </Badge>
        )}
      </div>

      {connected ? (
        <div className="mt-0.5 flex h-[42px] items-center gap-2 rounded-[10px] bg-green-soft px-3.5">
          <AppIcon name="check" size={16} className="text-green" />
          <span className="text-[13.5px] font-semibold text-green">
            Connected
          </span>
          <span className="tnum ml-auto text-xs text-ink-3">
            {BRAND.workspaceUrl}
          </span>
        </div>
      ) : (
        <Button
          variant="outline"
          className="mt-0.5 h-[42px] w-full"
          onClick={onConnect}
          disabled={connecting}
        >
          {connecting ? (
            <span className="inline-flex items-center gap-2 text-ink-3">
              <StatusIndicator tone="amber" pulse label="Connecting…" />
            </span>
          ) : (
            <>
              <AppIcon name="link" /> Connect {source.name}
            </>
          )}
        </Button>
      )}
    </Card>
  );
}

export interface StepConnectProps {
  connections: ReturnType<typeof useSourceConnections>;
  onBack: () => void;
  onNext: () => void;
}

/** Connect step: summary bar, connect-all action, source cards, trust panel. */
export function StepConnect({ connections, onBack, onNext }: StepConnectProps) {
  const {
    statusOf,
    connect,
    connectAll,
    connectedCount,
    isAllConnected,
    estimatedDecisions,
    totalSources,
  } = connections;

  return (
    <OnboardingFrame
      stepIndex={1}
      title="Plug in where your decisions already live"
      sub={`Read-only. ${BRAND.name} never writes back to your tools.`}
      onBack={onBack}
      onNext={onNext}
      canNext={connectedCount > 0}
      footerNote={`${connectedCount} of ${totalSources} connected`}
      nextLabel={connectedCount ? "Continue" : "Connect a source"}
    >
      {/* summary bar */}
      <Card className="mb-3.5 flex items-center gap-4 p-4 px-5">
        <div className="flex">
          {SOURCE_ORDER.map((id, i) => {
            const on = statusOf(id) === "connected";
            return (
              <span
                key={id}
                className={cn(
                  "grid size-[34px] place-items-center rounded-[9px] border-2 border-paper transition-all",
                  on ? "bg-paper-2 opacity-100" : "bg-cream opacity-50 grayscale",
                  i > 0 && "-ml-2.5"
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
              : `${connectedCount} of ${totalSources} sources connected`}
          </div>
          <div className="mt-0.5 whitespace-nowrap text-[13px] text-ink-3">
            {connectedCount === 0 ? (
              "Connect at least one to build your brain"
            ) : (
              <>
                ~
                <span className="tnum font-bold text-brand-ink">
                  {estimatedDecisions}
                </span>{" "}
                decisions ready to extract
              </>
            )}
          </div>
        </div>
        {isAllConnected ? (
          <Badge variant="green" className="ml-auto h-[30px] px-2.5">
            <AppIcon name="check" size={14} /> All connected
          </Badge>
        ) : (
          <Button size="sm" className="ml-auto" onClick={connectAll}>
            <AppIcon name="bolt" size={15} /> Connect all
          </Button>
        )}
      </Card>

      {/* cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {SOURCE_ORDER.map((id) => (
          <ConnectCard
            key={id}
            id={id}
            status={statusOf(id)}
            onConnect={() => connect(id)}
          />
        ))}

        {/* trust panel */}
        <Card className="flex flex-col gap-3 border-dashed bg-cream p-5">
          <span className="grid size-10 place-items-center rounded-[11px] border border-line bg-paper-2 text-brand-ink">
            <AppIcon name="review" size={21} />
          </span>
          <div className="text-[15px] font-bold tracking-tight text-ink">
            Read-only &amp; private
          </div>
          <div className="text-[13px] leading-[1.5] text-ink-3">
            {BRAND.name} only reads what you scope. We never post, edit, or
            delete in your tools — and you can revoke access anytime.
          </div>
          <div className="mt-auto flex flex-wrap gap-1.5">
            <Badge variant="outline">SOC 2 Type II</Badge>
            <Badge variant="outline">OAuth scoped</Badge>
          </div>
        </Card>
      </div>
    </OnboardingFrame>
  );
}
