import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/app/providers/AuthProvider";
import { SOURCES } from "@/constants/sources";
import type { SourceId } from "@/types/common";

import { sourceKeys } from "../api";

/**
 * Handles the return leg of a source OAuth flow.
 *
 * The provider redirects to the backend's callback, which finishes the token
 * exchange server-side and bounces the browser back with `?connected={provider}`
 * (or `?error=…` if consent was declined). We acknowledge the outcome, mark the
 * now-stale source queries for refetch, and strip the param so a reload doesn't
 * re-toast.
 *
 * Invalidation lives here rather than in a caller-supplied callback: the cache
 * key belongs to this feature, so any surface that handles the connect-return
 * (Sources, onboarding's connect step) gets it without knowing what went stale.
 *
 * `workspaceId` is read nullable, not via `useWorkspaceId()`, so this is safe to
 * mount on onboarding (which lives outside `RequireWorkspace`). A connect-return
 * always carries a workspace, so invalidation still fires when it matters; the
 * null branch just skips it.
 */
export function useConnectionLanding() {
  const { workspaceId } = useAuth();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const handled = useRef(false); // StrictMode double-invoke guard

  const connected = params.get("connected");
  const error = params.get("error");

  useEffect(() => {
    if (handled.current || (!connected && !error)) return;
    handled.current = true;

    if (error) {
      toast.error(
        error === "access_denied"
          ? "You declined access. No source was connected."
          : "We couldn't connect that source. Please try again.",
      );
    } else if (connected) {
      const name = SOURCES[connected as SourceId]?.name ?? connected;
      toast.success(`${name} connected`, {
        // The backend starts importing this source's history right after a
        // dashboard connect. If that didn't take, the card says so and offers
        // the import — so promise the import, not a notification we never send.
        description: "We're importing its history now — this can take a few minutes.",
      });
      if (workspaceId) {
        void queryClient.invalidateQueries({ queryKey: sourceKeys.all(workspaceId) });
      }
    }

    setParams(
      (current) => {
        current.delete("connected");
        current.delete("error");
        return current;
      },
      { replace: true },
    );
  }, [connected, error, queryClient, setParams, workspaceId]);
}
