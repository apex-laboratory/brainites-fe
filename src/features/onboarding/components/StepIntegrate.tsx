import { AppIcon, ErrorState, Skeleton } from "@/components/shared";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BRAND } from "@/constants/brand";
import { SETUP_STEPS } from "@/features/onboarding/data/onboarding-fixtures";
import { OnboardingShell } from "@/features/onboarding/components/OnboardingShell";
import { CopyBlock, CopyRow } from "@/features/onboarding/components/CopyField";
import { AgentSetup } from "@/features/onboarding/components/AgentSetup";
import { useIntegration } from "@/features/onboarding/hooks";

export interface StepIntegrateProps {
  onBack: () => void;
  onDone: () => void;
}

/** Placeholder for the credential panels while the settings + key calls resolve. */
function IntegrationSkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-3.5">
      <Skeleton className="h-[132px] rounded-2xl" />
      <Skeleton className="h-[168px] rounded-2xl" />
      <Skeleton className="h-[220px] rounded-2xl" />
    </div>
  );
}

type IntegrationPanelsProps = Pick<
  ReturnType<typeof useIntegration>,
  | "maskedKey"
  | "scopes"
  | "systemPrompt"
  | "clientConfig"
  | "guides"
  | "revealed"
  | "toggleReveal"
  | "copy"
> & {
  /** Non-null here: the panels render only once both have resolved. */
  endpoint: string;
  apiKey: string;
};

/** The credentials themselves: endpoint, key, prompt, config, per-agent guides. */
function IntegrationPanels({
  endpoint,
  apiKey,
  maskedKey,
  scopes,
  systemPrompt,
  clientConfig,
  guides,
  revealed,
  toggleReveal,
  copy,
}: IntegrationPanelsProps) {
  return (
    <div className="mt-8 flex flex-col gap-3.5 motion-safe:animate-fade-up">
      {/* Endpoint */}
      <Card className="p-6">
        <SectionLabel className="mb-2 pb-0">Brain endpoint</SectionLabel>
        <p className="mb-3.5 text-[13.5px] leading-relaxed text-ink-3">
          The MCP URL your clients connect to.
        </p>
        <CopyRow value={endpoint} onCopy={() => copy(endpoint, "Endpoint copied")} />
      </Card>

      {/* API key */}
      <Card className="p-6">
        <div className="mb-2 flex items-center gap-2.5">
          <SectionLabel className="pb-0">Agent API key</SectionLabel>
          <Badge variant="amber">Shown once</Badge>
        </div>
        <p className="mb-3.5 text-[13.5px] leading-relaxed text-ink-3">
          Sent as a{" "}
          <span className="font-mono text-[12.5px] text-ink-2">Bearer</span> token.
          Copy it now and store it as a secret — we can't show the full key again.
        </p>
        <CopyRow
          value={revealed ? apiKey : maskedKey}
          onCopy={() => copy(apiKey, "API key copied")}
          trailing={
            <Button
              size="sm"
              onClick={toggleReveal}
              className="h-[30px] flex-none bg-white/10 text-solid-ink shadow-none hover:bg-white/20"
              aria-label={revealed ? "Hide API key" : "Reveal API key"}
            >
              {revealed ? "Hide" : "Reveal"}
            </Button>
          }
        />
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-medium text-ink-4">Scopes</span>
          {scopes.map((scope) => (
            <Badge key={scope.id} variant="outline" className="font-mono">
              {scope.id}
            </Badge>
          ))}
        </div>
      </Card>

      {/* System prompt */}
      <Card className="p-6">
        <SectionLabel className="mb-2 pb-0">Agent system prompt</SectionLabel>
        <p className="mb-3.5 text-[13.5px] leading-relaxed text-ink-3">
          Drop this into your agents so they ground every answer in the{" "}
          {BRAND.name} brain instead of guessing.
        </p>
        <CopyBlock
          value={systemPrompt}
          onCopy={() => copy(systemPrompt, "System prompt copied")}
          rows={9}
        />
      </Card>

      {/* MCP client config */}
      <Card className="p-6">
        <SectionLabel className="mb-2 pb-0">MCP client config</SectionLabel>
        <p className="mb-3.5 text-[13.5px] leading-relaxed text-ink-3">
          Endpoint and key wired together for an MCP-compatible client.
        </p>
        <CopyBlock
          value={clientConfig}
          onCopy={() => copy(clientConfig, "Config copied")}
          rows={8}
        />
      </Card>

      {/* Per-agent setup guides */}
      <Card className="p-6">
        <SectionLabel className="mb-2 pb-0">Add to your agent</SectionLabel>
        <p className="mb-4 text-[13.5px] leading-relaxed text-ink-3">
          Pick your framework for a copy-paste setup — every snippet is pre-filled
          with your endpoint and key.
        </p>
        <AgentSetup
          guides={guides}
          onCopy={(value, label) => copy(value, label ?? "Copied")}
        />
      </Card>
    </div>
  );
}

/**
 * Final onboarding step. The brain is built — this hands the tenant everything
 * they need to point their own agents at it: the brain endpoint, a freshly
 * minted agent API key, the recommended agent system prompt, and a ready-to-use
 * MCP client config. All logic lives in {@link useIntegration}.
 */
export function StepIntegrate({ onBack, onDone }: StepIntegrateProps) {
  const { isError, error, retry, endpoint, apiKey, workspaceName, ...panels } =
    useIntegration();

  return (
    <OnboardingShell
      stepIndex={SETUP_STEPS.length}
      footer={
        <>
          <Button variant="ghost" onClick={onBack}>
            <AppIcon name="arrowLeft" /> Back
          </Button>
          <div className="ml-auto flex items-center gap-[18px]">
            <span className="hidden text-[13px] font-medium text-ink-4 sm:block">
              You can find these again in Settings
            </span>
            <Button onClick={onDone}>
              Go to dashboard
              <AppIcon name="arrow" />
            </Button>
          </div>
        </>
      }
    >
      <div className="mx-auto max-w-[760px] pb-10 pt-10 md:pt-14">
        <div className="motion-safe:animate-fade-up">
          <div className="mb-3 flex items-center gap-2.5">
            <SectionLabel className="pb-0">Connect your agents</SectionLabel>
            <Badge variant="green">Live</Badge>
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-ink md:text-[34px]">
            Plug {workspaceName} into your agents
          </h1>
          <p className="mt-3 max-w-[560px] text-[15px] leading-[1.5] text-ink-3 md:text-base">
            Your brain is live. Point any agent, MCP client, or service at the
            endpoint below to query {workspaceName}'s decisions, policies, and
            runbooks with source-backed answers.
          </p>
        </div>

        {/* `!endpoint || !apiKey` *is* the hook's isLoading once isError is ruled
            out — and unlike isLoading it narrows both to non-null for the panels. */}
        {isError ? (
          <ErrorState
            className="mt-8"
            error={error}
            onRetry={retry}
            title="Couldn't prepare your agent credentials"
          />
        ) : !endpoint || !apiKey ? (
          <IntegrationSkeleton />
        ) : (
          <IntegrationPanels {...panels} endpoint={endpoint} apiKey={apiKey} />
        )}
      </div>
    </OnboardingShell>
  );
}
