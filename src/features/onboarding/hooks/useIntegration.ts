import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth, useWorkspaceId } from "@/app/providers/AuthProvider";
import { useCopyToClipboard, useDisclosure } from "@/hooks";
import {
  apiKeysApi,
  useSettings,
  type ApiKeyCreated,
  type ApiKeyScope,
} from "@/features/settings";
import {
  AGENT_SCOPES,
  buildAgentGuides,
  buildClientConfig,
  buildSystemPrompt,
} from "@/features/onboarding/data/integration";

/** Mask all but the prefix and last four characters of a secret. */
function maskKey(key: string): string {
  const [prefix] = key.split(/(?<=_)/); // keep up through the trailing "_"
  const head = key.slice(0, Math.max(prefix.length, 8));
  const tail = key.slice(-4);
  return `${head}${"•".repeat(18)}${tail}`;
}

/**
 * Real integration credentials for the final onboarding step:
 *  - the brain endpoint from `GET /settings`;
 *  - a genuine agent API key minted **once** via `POST /api-keys` (shown once,
 *    never cached — held in local state only);
 *  - the agent system prompt, MCP client config, and per-framework guides,
 *    templated with the live endpoint + key + workspace slug.
 *
 * Surfaces `isLoading` / `isError` / `retry` so the step can gate on both the
 * settings fetch and the key mint before rendering credentials.
 */
export function useIntegration() {
  const workspaceId = useWorkspaceId();
  const { workspace } = useAuth();
  const { copy } = useCopyToClipboard();
  const reveal = useDisclosure(false);

  const settings = useSettings();
  const endpoint = settings.settings?.brainEndpoint ?? null;

  // Mint at most once per workspace per session. The result is cached, never
  // refetched, and never garbage-collected, so leaving the integrate step and
  // returning (Back → Next) re-reads the same key instead of minting a second
  // live credential — the failure a per-mount ref guard could not prevent.
  // React Query also single-flights the in-flight request, covering StrictMode.
  const keyQuery = useQuery({
    queryKey: ["onboarding-agent-key", workspaceId],
    queryFn: () =>
      apiKeysApi.create(workspaceId, {
        name: "Onboarding agent key",
        scopes: AGENT_SCOPES.map((scope) => scope.id as ApiKeyScope),
      }),
    enabled: Boolean(workspaceId),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const created: ApiKeyCreated | null = keyQuery.data ?? null;

  const apiKey = created?.apiKey ?? null;
  const slug = workspace?.slug ?? "brain";
  const workspaceName = workspace?.name ?? "your workspace";

  const maskedKey = useMemo(() => (apiKey ? maskKey(apiKey) : ""), [apiKey]);
  const systemPrompt = useMemo(() => buildSystemPrompt(workspaceName), [workspaceName]);
  const clientConfig = useMemo(
    () => (endpoint && apiKey ? buildClientConfig(endpoint, apiKey) : ""),
    [endpoint, apiKey],
  );
  const guides = useMemo(
    () => (endpoint && apiKey ? buildAgentGuides({ endpoint, apiKey, slug }) : []),
    [endpoint, apiKey, slug],
  );

  const ready = Boolean(endpoint && apiKey);
  const isError = settings.isError || keyQuery.isError;
  const isLoading = !ready && !isError;

  const retry = () => {
    if (settings.isError) void settings.refetch();
    if (keyQuery.isError) void keyQuery.refetch();
  };

  return {
    isLoading,
    isError,
    error: settings.error ?? keyQuery.error,
    retry,
    ready,
    endpoint,
    apiKey,
    maskedKey,
    workspaceName,
    scopes: AGENT_SCOPES,
    systemPrompt,
    clientConfig,
    guides,
    revealed: reveal.isOpen,
    toggleReveal: reveal.toggle,
    copy,
  };
}
