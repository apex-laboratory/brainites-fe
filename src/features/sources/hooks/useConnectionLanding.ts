import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { SOURCES } from "@/constants/sources";
import type { SourceId } from "@/types/common";

/**
 * Handles the return leg of a source OAuth flow.
 *
 * The provider redirects to the backend's callback, which finishes the token
 * exchange server-side and bounces the browser back with `?connected={provider}`
 * (or `?error=…` if consent was declined). We acknowledge the outcome, refetch
 * the now-stale source list, and strip the param so a reload doesn't re-toast.
 */
export function useConnectionLanding(refetch: () => void) {
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
        description: "We'll let you know once the first sync completes.",
      });
      refetch();
    }

    setParams(
      (current) => {
        current.delete("connected");
        current.delete("error");
        return current;
      },
      { replace: true },
    );
  }, [connected, error, refetch, setParams]);
}
