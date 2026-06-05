import { toast } from "sonner";

import { AppIcon, SectionLabel } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BRAND } from "@/constants/brand";
import { WORKSPACE } from "@/features/dashboard/data/workspace";

import { SetRow } from "./SetRow";

/** Settings → General tab: workspace details + brain endpoint. */
export function SettingsGeneral() {
  const copyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(BRAND.brainEndpoint);
      toast.success("Endpoint copied to clipboard");
    } catch {
      toast.error("Couldn't copy the endpoint");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-6">
        <SectionLabel className="mb-4 pb-0">Workspace</SectionLabel>
        <div className="flex flex-col">
          <SetRow label="Workspace name" value={WORKSPACE.name} />
          <SetRow label="Workspace URL" value={WORKSPACE.url} mono />
          <SetRow
            label="Plan"
            value={`Pro · ${WORKSPACE.memberCount} seats`}
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
            {BRAND.brainEndpoint}
          </span>
          <Button
            size="sm"
            onClick={copyEndpoint}
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
