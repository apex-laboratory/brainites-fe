import { AppIcon, EmptyState, ErrorState, Skeleton } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRelativeTime } from "@/utils/date";
import { cn } from "@/utils/cn";

import { useApiKeys } from "../hooks";
import { CreateApiKeyDialog } from "./CreateApiKeyDialog";

/** Settings → API keys tab: mint and revoke workspace agent keys. */
export function SettingsApiKeys() {
  const { keys, isPending, isError, error, refetch, create, revoke } = useApiKeys();

  const createKey = (
    <CreateApiKeyDialog
      pending={create.isPending}
      onCreate={(name, scopes) => create.mutateAsync({ name, scopes })}
      trigger={
        <Button variant="solid" size="sm" className="ml-auto">
          <AppIcon name="plus" size={15} />
          Create key
        </Button>
      }
    />
  );

  if (isPending) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Couldn't load API keys"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center border-b border-line px-5 py-4">
        <div>
          <div className="text-[15px] font-bold text-ink">API keys</div>
          <div className="mt-0.5 text-[12.5px] text-ink-3">
            {keys.length} active {keys.length === 1 ? "key" : "keys"}
          </div>
        </div>
        {createKey}
      </div>

      {keys.length === 0 ? (
        <EmptyState
          className="border-0 shadow-none"
          icon="sparkles"
          title="No API keys yet"
          sub="Create one to let an agent or service query this workspace's brain."
          action={createKey}
        />
      ) : (
        keys.map((apiKey, i) => (
          <div
            key={apiKey.id}
            className={cn(
              "flex flex-wrap items-center gap-3 px-5 py-3.5",
              i && "border-t border-line-soft",
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">{apiKey.name}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
                {/* The prefix is all the server keeps — the rest was shown once. */}
                <span className="font-mono">{apiKey.prefix}…</span>
                <span>
                  {apiKey.lastUsedAt
                    ? `Last used ${formatRelativeTime(apiKey.lastUsedAt)}`
                    : "Never used"}
                </span>
                <span>· Created {formatRelativeTime(apiKey.createdAt) ?? "—"}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {apiKey.scopes.map((scope) => (
                <Badge key={scope} variant="outline" className="font-mono">
                  {scope}
                </Badge>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={revoke.isPending}
              onClick={() => revoke.mutate(apiKey.id)}
            >
              Revoke
            </Button>
          </div>
        ))
      )}
    </Card>
  );
}
