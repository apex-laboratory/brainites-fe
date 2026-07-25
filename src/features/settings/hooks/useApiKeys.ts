import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { optimisticRemove, rollbackRemove } from "@/lib/api";

import {
  apiKeyKeys,
  apiKeysApi,
  type ApiKeySummary,
  type CreateApiKeyInput,
} from "../api";

/** Both mutations 403 for a non-admin; say so rather than echoing the server. */
const ADMIN_ONLY = { forbidden: "Managing API keys is admin-only." };

/**
 * Workspace API keys: the roster plus mint and revoke. Admin-only on the
 * backend.
 *
 * The raw secret from `create` is deliberately *not* surfaced here — it exists
 * for one render and belongs in component state. Returning it from a hook would
 * invite someone to cache it.
 */
export function useApiKeys() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const key = apiKeyKeys.all(workspaceId);

  const query = useQuery({
    queryKey: key,
    queryFn: () => apiKeysApi.list(workspaceId),
  });

  const create = useMutation({
    mutationFn: (input: CreateApiKeyInput) => apiKeysApi.create(workspaceId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    meta: { errorMessage: "Couldn't create that key.", errorMessages: ADMIN_ONLY },
  });

  const revoke = useMutation({
    mutationFn: (keyId: string) => apiKeysApi.revoke(workspaceId, keyId),
    // Drop the row immediately: a revoked key is dead the moment it's confirmed,
    // and leaving it on screen reads as "the revoke didn't work".
    onMutate: (keyId) => optimisticRemove<ApiKeySummary>(queryClient, key, [keyId]),
    onSuccess: () => toast.success("Key revoked"),
    onError: (_err, _keyId, context) => rollbackRemove(queryClient, key, context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
    meta: { errorMessage: "Couldn't revoke that key.", errorMessages: ADMIN_ONLY },
  });

  return {
    keys: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    create,
    revoke,
  };
}
