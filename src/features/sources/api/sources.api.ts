import { z } from "zod";

import { api } from "@/lib/api";

import {
  AuthorizeSchema,
  SourceListSchema,
  SourceScopeSchema,
  type Authorize,
  type ChannelSelection,
  type Source,
  type SourceProvider,
  type SourceScope,
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

  /** The source's scope: its channels + the persisted lookback window. */
  scope: (sourceId: string): Promise<SourceScope> =>
    api.get(`/sources/${sourceId}/channels`, SourceScopeSchema),

  /**
   * Persist the channel selection + lookback window. Returns the scope as now
   * stored — including `lookbackDays` — so the caller can seed its cache from
   * the response rather than refetching to learn what was saved.
   */
  saveScope: (
    sourceId: string,
    selection: ChannelSelection,
  ): Promise<SourceScope> =>
    api.patch(`/sources/${sourceId}/channels`, SourceScopeSchema, selection),

  /**
   * Import this source's history — a sweep scoped to this one connection.
   *
   * Connecting a source ingests nothing on its own, so without this a source
   * added outside onboarding only ever knows about events from the moment it
   * was connected. `202` for a newly started import, `200` when one was already
   * in flight. The body is the sweep, which the card doesn't need: it tracks
   * progress off `syncStatus` on the refetched source, so it's discarded here.
   */
  backfill: (sourceId: string): Promise<void> =>
    api.post(`/sources/${sourceId}/backfill`, z.unknown()).then(() => undefined),

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
  scope: (workspaceId: string, sourceId: string) =>
    ["sources", workspaceId, "scope", sourceId] as const,
};
