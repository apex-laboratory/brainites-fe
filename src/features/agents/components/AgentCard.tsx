import { useNavigate } from "react-router-dom";

import { AppIcon, SectionLabel } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

import { MODEL_LABELS, type Agent, type AgentModel } from "../api";
import { useAgentConnectors } from "../hooks";

export interface AgentCardProps {
  agent: Agent;
}

/**
 * One agent card.
 *
 * §6.1 specifies connector avatars, schedule state and last run. Only the first
 * exists today — schedules are the backend's phase 6 and sessions are phase 4 —
 * so this renders what it can and stays quiet about the rest. A card that
 * showed "Last run: never" for a feature nobody can use yet would read as a
 * broken agent rather than an unbuilt surface.
 */
export function AgentCard({ agent }: AgentCardProps) {
  const navigate = useNavigate();
  const { entries } = useAgentConnectors(agent.id);

  const model = MODEL_LABELS[agent.model as AgentModel]?.label ?? agent.model;
  const open = () => navigate(ROUTES.agentDetail(agent.id));

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium">{agent.name}</h3>
            {agent.status === "draft" && (
              <Badge variant="outline" className="shrink-0">
                Draft
              </Badge>
            )}
            {agent.visibility === "workspace" && (
              <Badge variant="accent" className="shrink-0">
                Shared
              </Badge>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {agent.description ?? "No description yet."}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={open} aria-label={`Open ${agent.name}`}>
          <AppIcon name="arrow" size={15} />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {model && (
          <span className="inline-flex items-center gap-1.5">
            <AppIcon name="sparkles" size={13} />
            {model}
          </span>
        )}
        {agent.groundInBrain && (
          <span className="inline-flex items-center gap-1.5">
            <AppIcon name="brain" size={13} />
            Grounded
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <AppIcon name="link" size={13} />
          {entries.length === 0
            ? "No connectors"
            : `${entries.length} connector${entries.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {entries.length > 0 && (
        <div>
          <SectionLabel>Connected to</SectionLabel>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {entries.slice(0, 6).map(({ connector }) => (
              <Badge key={connector.id} variant="outline" className="font-normal">
                {connector.name}
              </Badge>
            ))}
            {entries.length > 6 && (
              <Badge variant="outline" className="font-normal">
                +{entries.length - 6}
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={open}>
          {agent.isOwner ? "Edit" : "View"}
        </Button>
      </div>
    </Card>
  );
}
