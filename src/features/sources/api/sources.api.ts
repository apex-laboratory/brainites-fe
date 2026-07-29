import { z } from "zod";

import { api } from "@/lib/api";

import {
  AuthorizeSchema,
  SourceChannelListSchema,
  SourceListSchema,
  type Authorize,
  type ChannelSelection,
  type Source,
  type SourceChannel,
  type SourceProvider,
} from "./sources.schemas";

/**
 * Sources endpoint functions. Workspace scope comes from the JWT, so no
 * `workspaceId` is threaded through these paths (see INTEGRATIONS.md).
 * All routes require an **admin** role; a member gets `403`.
 */
export const sourcesApi = {
  list: (): Promise<Source[]> => api.get("/sources", SourceListSchema),

  /**
   * Begin OAuth. Returns the provider's consent URL — the caller must do a
   * full-page `window.location.href` redirect to it, not an XHR fetch.
   * `subdomain` is required for Zendesk and rejected elsewhere.
   *
   * `returnTo` is the frontend path the backend callback redirects back to on
   * completion (allowlisted server-side to `/onboarding` and `/dashboard/sources`;
   * anything else silently falls back to the default). Sent camelCase per the
   * backend contract for this body — do not snake_case it.
   */
  authorize: (
    provider: SourceProvider,
    subdomain?: string,
    returnTo?: string,
  ): Promise<Authorize> =>
    api.post(`/sources/${provider}/authorize`, AuthorizeSchema, {
      ...(subdomain ? { subdomain } : {}),
      ...(returnTo ? { returnTo } : {}),
    }),

  channels: (sourceId: string): Promise<SourceChannel[]> =>
    api.get(`/sources/${sourceId}/channels`, SourceChannelListSchema),

  /** Persist the channel selection + lookback window. Returns the full list. */
  saveChannels: (
    sourceId: string,
    selection: ChannelSelection,
  ): Promise<SourceChannel[]> =>
    api.patch(`/sources/${sourceId}/channels`, SourceChannelListSchema, selection),

  /** Revoke provider-side, then delete the connection. `204`, no body. */
  disconnect: (sourceId: string): Promise<void> =>
    api.post(`/sources/${sourceId}/disconnect`, z.void()),
};

/**
 * Query keys for the sources feature. Sources are workspace-scoped by JWT, but
 * the key carries `workspaceId` so switching workspaces can't serve a stale
 * cache, and so a workspace-wide invalidation is one call.
 */
export const sourceKeys = {
  all: (workspaceId: string) => ["sources", workspaceId] as const,
  channels: (workspaceId: string, sourceId: string) =>
    ["sources", workspaceId, "channels", sourceId] as const,
};
