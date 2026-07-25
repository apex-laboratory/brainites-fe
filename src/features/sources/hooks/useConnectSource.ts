import { useMutation } from "@tanstack/react-query";

import { sourcesApi, type SourceProvider } from "../api";

export type ConnectVariables = {
  provider: SourceProvider;
  /** Required for subdomain-scoped providers (Zendesk); rejected elsewhere. */
  subdomain?: string;
};

/**
 * Begin a source OAuth connection. On success the browser is handed to the
 * provider's consent page — a full-page redirect, per the backend contract
 * ("do not fetch `authorizeUrl` with XHR").
 *
 * The provider eventually redirects back to `/settings/sources?connected=…`,
 * which the router forwards to the Sources page (see `SourcesPage`).
 *
 * Failures fall through to the global mutation `onError` toast. The mutation is
 * left in `isPending` after a successful redirect on purpose: the page is being
 * torn down, and a button that stays disabled prevents a double-consent.
 */
export function useConnectSource() {
  return useMutation({
    mutationFn: ({ provider, subdomain }: ConnectVariables) =>
      sourcesApi.authorize(provider, subdomain),
    onSuccess: ({ authorizeUrl }) => {
      window.location.href = authorizeUrl;
    },
  });
}
