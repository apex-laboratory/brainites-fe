import { useNavigate, useParams } from "react-router-dom";

import { AppIcon, ErrorState, PageHeader, SectionLabel } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

import { AgentBuilderForm, ConnectorPicker } from "../components";
import {
  useAgent,
  useAgentVersions,
  useCreateAgent,
  useSetVisibility,
  useUpdateAgent,
} from "../hooks";

/**
 * The builder. Serves both `/agents/new` and `/agents/:agentId`.
 *
 * One page rather than two because the form is identical — the only difference
 * is that a new agent has no id yet, and so cannot have connectors or a version
 * history. Splitting them would mean maintaining the same eleven fields twice.
 */
export function AgentBuilderPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const isNew = !agentId;

  return isNew ? <CreateAgent /> : <EditAgent agentId={agentId} />;
}

function CreateAgent() {
  const navigate = useNavigate();
  const create = useCreateAgent();

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        label="New"
        title="Build an agent"
        sub="Name it and describe how it should behave. You can add tools once it exists."
        right={
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.agents)}>
            Cancel
          </Button>
        }
      />
      <div className="mx-auto max-w-[760px] px-6 pb-14 pt-6 md:px-10">
        <AgentBuilderForm
          saving={create.isPending}
          onSubmit={(state) =>
            create.mutate({
              name: state.name,
              description: state.description.trim() || null,
              systemPrompt: state.systemPrompt.trim() || null,
              model: state.model,
              effort: state.effort,
              groundInBrain: state.groundInBrain,
            })
          }
        />
      </div>
    </div>
  );
}

function EditAgent({ agentId }: { agentId: string }) {
  const navigate = useNavigate();
  const { data: agent, isPending, isError, error, refetch } = useAgent(agentId);
  const update = useUpdateAgent(agentId);
  const visibility = useSetVisibility(agentId);
  const versions = useAgentVersions(agentId);

  if (isPending) {
    return (
      <div className="mx-auto max-w-[760px] px-6 py-10 md:px-10">
        <Card className="h-96 animate-pulse" />
      </div>
    );
  }

  if (isError || !agent) {
    return (
      <div className="mx-auto max-w-[760px] px-6 py-10 md:px-10">
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          title="Couldn't load this agent"
        />
      </div>
    );
  }

  const published = agent.visibility === "workspace";
  // The server decides; `isOwner` is computed there. Editing a published agent
  // you don't own is refused server-side, so the form is read-only here.
  const readOnly = !agent.isOwner;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[760px] px-6 pt-6 md:px-10">
        <button
          type="button"
          onClick={() => navigate(ROUTES.agents)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
        >
          <AppIcon name="arrowLeft" size={13} />
          Agents
        </button>
      </div>

      <PageHeader
        label={published ? "Shared with your workspace" : "Private to you"}
        title={agent.name}
        sub={agent.description ?? undefined}
        right={
          readOnly ? (
            <Badge variant="outline">View only</Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={visibility.isPending}
              onClick={() => visibility.mutate(!published)}
            >
              {published ? "Make private" : "Publish to workspace"}
            </Button>
          )
        }
      />

      <div className="mx-auto max-w-[760px] px-6 pb-14 pt-6 md:px-10">
        {readOnly && (
          <Card className="mb-6 px-4 py-3 text-xs text-muted-foreground">
            Shared with you by someone else in this workspace. You can see how it&apos;s built,
            but only its owner can change it.
          </Card>
        )}

        <AgentBuilderForm
          agent={agent}
          saving={update.isPending}
          readOnly={readOnly}
          onSubmit={(_state, changed) => {
            // Nothing changed — don't spend a round-trip that would 409 on a
            // stale version for a save with no content.
            if (Object.keys(changed).length === 0) return;
            update.mutate({ ...changed, version: agent.version });
          }}
        >
          <ConnectorPicker agentId={agentId} readOnly={readOnly} />
        </AgentBuilderForm>

        <section className="mt-10 border-t pt-6">
          <SectionLabel>Version history</SectionLabel>
          <p className="mt-1 text-xs text-muted-foreground">
            Every change to the agent&apos;s instructions, model or tools mints a version you
            can point a run back at.
          </p>
          <div className="mt-3 space-y-1.5">
            {versions.isPending ? (
              <Card className="h-16 animate-pulse" />
            ) : (versions.data ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No versions yet — this agent hasn&apos;t been saved to the runtime.
              </p>
            ) : (
              (versions.data ?? []).map((version) => (
                <Card
                  key={version.version ?? version.createdAt}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-sm">
                    Version {version.version}
                    {version.version === agent.version && (
                      <Badge variant="outline" className="ml-2 font-normal">
                        Current
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {version.createdAt
                      ? new Date(version.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
