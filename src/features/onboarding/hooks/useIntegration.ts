import { useMemo } from "react";

import { useCopyToClipboard, useDisclosure } from "@/hooks";
import {
  AGENT_SYSTEM_PROMPT,
  INTEGRATION,
  MCP_CLIENT_CONFIG,
} from "@/features/onboarding/data/integration";

/** Mask all but the prefix and last four characters of a secret. */
function maskKey(key: string): string {
  const [prefix] = key.split(/(?<=_)/); // keep up through the trailing "_"
  const head = key.slice(0, Math.max(prefix.length, 8));
  const tail = key.slice(-4);
  return `${head}${"•".repeat(18)}${tail}`;
}

/**
 * Surfaces the tenant's integration credentials for the final onboarding step:
 * the brain endpoint, the agent API key (with reveal/mask state), the agent
 * system prompt, an MCP client config, and a copy helper. Static data, UI
 * state, and copy side-effects composed here so the step stays presentational.
 */
export function useIntegration() {
  const { copy } = useCopyToClipboard();
  const reveal = useDisclosure(false);

  const maskedKey = useMemo(() => maskKey(INTEGRATION.apiKey), []);

  return {
    endpoint: INTEGRATION.endpoint,
    apiKey: INTEGRATION.apiKey,
    maskedKey,
    scopes: INTEGRATION.scopes,
    systemPrompt: AGENT_SYSTEM_PROMPT,
    clientConfig: MCP_CLIENT_CONFIG,
    revealed: reveal.isOpen,
    toggleReveal: reveal.toggle,
    copy,
  };
}
