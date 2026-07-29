import { useMutation } from "@tanstack/react-query";

import { sourcesApi, type SourceProvider } from "../api";

export type ConnectVariables = {
  provider: SourceProvider;
  /** Required for subdomain-scoped providers (Zendesk); rejected elsewhere. */
  subdomain?: string;
  /** Allowlisted frontend path the OAuth callback returns to — `/onboarding`
   * when started mid-wizard, `/dashboard/sources` from the Sources page.
   * Omitted → the backend default. */
  returnTo?: string;
};

/**
 * Begin a source OAuth connection. On success the browser is handed to the
 * provider's consent page — a full-page redirect, per the backend contract
 * ("do not fetch `authorizeUrl` with XHR").
 *
 * The provider eventually redirects back to `{returnTo}?connected=…` (or the
 * backend default `/settings/sources`, which the router forwards to the Sources
 * page). Whichever surface owns that path handles the return leg via
 * `useConnectionLanding`.
 *
 * Failures are rendered inline by the dialog rather than toasted: the two
 * connector failures need different affordances — a `not_configured` provider
 * can never be connected on this deployment, so offering a retry would be a lie,
 * while `connector_authorization_failed` is worth retrying with the server's
 * explanation attached to the row that failed.
 *
 * The mutation is left in `isPending` after a successful redirect on purpose:
 * the page is being torn down, and a button that stays disabled prevents a
 * double-consent.
 */
export function useConnectSource() {
  return useMutation({
    mutationFn: ({ provider, subdomain, returnTo }: ConnectVariables) =>
      sourcesApi.authorize(provider, subdomain, returnTo),
    onSuccess: ({ authorizeUrl }) => {
      window.location.href = authorizeUrl;
    },
    meta: { errorToast: false },
  });
}
