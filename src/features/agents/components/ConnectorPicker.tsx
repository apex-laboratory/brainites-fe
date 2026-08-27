import { AppIcon, EmptyState, SectionLabel } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { MAX_CONNECTORS } from "../api";
import { useAgentConnectors, useRemoveConnector, type ConnectorEntry } from "../hooks";
import { CustomMcpDialog } from "./CustomMcpDialog";

export interface ConnectorPickerProps {
  agentId: string;
  /** Non-owners see the wiring but cannot change it. */
  readOnly?: boolean;
}

/**
 * Which MCP servers this agent talks to.
 *
 * §6.1 describes this as "the catalog grid plus one row at the bottom: *Connect
 * any MCP server*". The catalog half needs `GET /agents/catalog`, which does not
 * exist yet — so today this is the bottom row plus the list of what's already
 * wired. The grid drops in above without changing anything here.
 *
 * Each row carries a `status` from the hook that is always `"available"` for
 * now; when `GET /agent-credentials` lands (backend phase 2) an unauthorized
 * connector renders as *Needs your account* with a Connect button, and only
 * this component's `renderStatus` changes.
 */
export function ConnectorPicker({ agentId, readOnly }: ConnectorPickerProps) {
  const { entries, isPending, atCapacity, remaining } = useAgentConnectors(agentId);
  const removeConnector = useRemoveConnector(agentId);

  const takenNames = entries.map((e) => e.connector.name);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <SectionLabel>Connectors</SectionLabel>
          <p className="mt-1 text-xs text-muted-foreground">
            Tools this agent can reach during a run. Your data goes to the tool and back — it
            never lands in Brainite.
          </p>
        </div>
        {!readOnly && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {entries.length} / {MAX_CONNECTORS}
          </span>
        )}
      </div>

      {isPending ? (
        <Card className="h-24 animate-pulse" />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No connectors yet"
          sub="This agent can still think and write — it just can't reach your other tools."
        />
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <ConnectorRow
              key={entry.connector.id}
              entry={entry}
              readOnly={readOnly}
              removing={
                removeConnector.isPending && removeConnector.variables === entry.connector.id
              }
              onRemove={() => removeConnector.mutate(entry.connector.id)}
            />
          ))}
        </div>
      )}

      {!readOnly && (
        <div className="pt-1">
          {atCapacity ? (
            <p className="text-xs text-muted-foreground">
              This agent is at the {MAX_CONNECTORS}-connector limit. Remove one to add another.
            </p>
          ) : (
            <CustomMcpDialog
              agentId={agentId}
              takenNames={takenNames}
              trigger={
                <Button variant="outline" size="sm">
                  <AppIcon name="plus" size={15} />
                  Connect any MCP server
                </Button>
              }
            />
          )}
          {!atCapacity && remaining <= 3 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {remaining} slot{remaining === 1 ? "" : "s"} left.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ConnectorRow({
  entry,
  readOnly,
  removing,
  onRemove,
}: {
  entry: ConnectorEntry;
  readOnly?: boolean;
  removing: boolean;
  onRemove: () => void;
}) {
  const { connector, status } = entry;

  return (
    <Card className="flex items-center gap-3 px-4 py-3">
      <AppIcon name="link" size={15} className="shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{connector.name}</span>
          {connector.toolAllowlist.length > 0 && (
            <Badge variant="outline" className="shrink-0 font-normal">
              {connector.toolAllowlist.length} tool
              {connector.toolAllowlist.length === 1 ? "" : "s"}
            </Badge>
          )}
          {/* Phase 2 fills this in; today every connector reads as available. */}
          {status === "needs-auth" && (
            <Badge variant="outline" className="shrink-0 font-normal">
              Needs your account
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{connector.mcpServerUrl}</p>
      </div>
      {!readOnly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={removing}
          aria-label={`Remove ${connector.name}`}
        >
          <AppIcon name="close" size={15} />
        </Button>
      )}
    </Card>
  );
}
