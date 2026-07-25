import { AppIcon, ErrorState, SectionLabel, Skeleton } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks";

import { useSettings } from "../hooks";
import { SetRow } from "./SetRow";

/** Settings → General tab: workspace details + brain endpoint. */
export function SettingsGeneral() {
  const { settings, isPending, isError, error, refetch, update } = useSettings();
  const { copy } = useCopyToClipboard();

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Couldn't load workspace settings"
      />
    );
  }

  const { workspace, brainEndpoint } = settings;

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-6">
        <SectionLabel className="mb-4 pb-0">Workspace</SectionLabel>
        <div className="flex flex-col">
          <SetRow
            label="Workspace name"
            value={workspace.name}
            onSave={async (name) => {
              await update.mutateAsync({ name });
            }}
          />
          <SetRow
            label="Domain"
            value={workspace.domain ?? ""}
            mono
            onSave={async (domain) => {
              await update.mutateAsync({ domain });
            }}
          />
          <SetRow
            label="Plan"
            value={`${workspace.plan} · ${workspace.seatLimit} seats`}
            editable={false}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <SectionLabel className="pb-0">Brain endpoint</SectionLabel>
          <Badge variant="green">Live</Badge>
        </div>
        <p className="mb-3.5 text-[13.5px] leading-relaxed text-ink-3">
          Point your agents and MCP clients here to query the brain.
        </p>
        <div className="flex items-center gap-2.5 rounded-[11px] bg-solid px-4 py-3">
          <span className="tnum min-w-0 flex-1 truncate font-mono text-[13px] text-solid-ink">
            {brainEndpoint}
          </span>
          <Button
            size="sm"
            onClick={() =>
              settings && copy(settings.brainEndpoint, "Endpoint copied to clipboard")
            }
            className="h-[30px] bg-white/10 text-solid-ink shadow-none hover:bg-white/20"
          >
            <AppIcon name="link" size={13} />
            Copy
          </Button>
        </div>
      </Card>
    </div>
  );
}
