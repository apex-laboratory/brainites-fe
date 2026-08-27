import { useNavigate } from "react-router-dom";

import { AppIcon, EmptyState, ErrorState, PageHeader, SectionLabel, StatStrip } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

import { AgentCard } from "../components";
import { byRecency, useAgents } from "../hooks";

/**
 * Agents overview — two groups, *Yours* and *Shared in your workspace*.
 *
 * The split comes from the server's `isOwner`, not from comparing user ids
 * here; the backend's RLS policy already decides who sees what, and a second
 * implementation of that rule in the client is a second place for it to drift.
 */
export function AgentsPage() {
  const navigate = useNavigate();
  const { mine, shared, stats, isPending, isError, error, refetch } = useAgents();

  const newAgent = (
    <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.agentNew)}>
      <AppIcon name="plus" size={15} />
      New agent
    </Button>
  );

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        label={isPending ? "Loading…" : isError ? "Unavailable" : `${mine.length + shared.length} total`}
        title="Agents"
        sub="Agents that already know how your company works. They reach your tools at runtime — your data never lands here."
        right={newAgent}
      />

      <div className="mx-auto max-w-[1180px] px-6 pb-14 pt-6 md:px-10">
        {isPending ? (
          <AgentsSkeleton />
        ) : isError ? (
          <ErrorState
            error={error}
            onRetry={() => void refetch()}
            title="Couldn't load your agents"
          />
        ) : mine.length === 0 && shared.length === 0 ? (
          <EmptyState
            icon="sparkles"
            title="No agents yet"
            sub="Build one that answers with your reviewed knowledge instead of guessing."
            action={newAgent}
          />
        ) : (
          <div className="space-y-8">
            <section>
              <SectionLabel>Yours</SectionLabel>
              {mine.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  You haven&apos;t built one yet.
                </p>
              ) : (
                <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[...mine].sort(byRecency).map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              )}
            </section>

            {shared.length > 0 && (
              <section>
                <SectionLabel>Shared in your workspace</SectionLabel>
                <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[...shared].sort(byRecency).map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {!isPending && !isError && (mine.length > 0 || shared.length > 0) && (
          <div className="mt-8">
            <StatStrip stats={stats} />
          </div>
        )}
      </div>
    </div>
  );
}

function AgentsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="h-48 animate-pulse" />
      ))}
    </div>
  );
}
