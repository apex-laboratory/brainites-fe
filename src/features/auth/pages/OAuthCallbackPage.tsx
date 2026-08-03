import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { AppLogo } from "@/components/shared/AppLogo";
import { Spinner } from "@/components/shared/QueryState";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { clearOAuthProvider, recallOAuthProvider } from "@/features/auth/api";
import { isApiError } from "@/lib/api";

/**
 * Landing page for the provider redirect after OAuth consent. The BE registers a
 * single provider-less `/auth/callback` redirect_uri, so the provider isn't in
 * the URL — it's recalled from sessionStorage (stashed when the flow started).
 * Reads `code` + `state` from the URL, exchanges them for a session, then the
 * AuthProvider routes onward per `nextStep`. Renders a clear, actionable error
 * if the provider declined or the exchange fails — never a blank screen.
 */
export function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const { completeOAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false); // StrictMode double-invoke + single-use state guard

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const provider = recallOAuthProvider();
    clearOAuthProvider(); // single-use: consume it whatever the outcome
    const providerErr = params.get("error");
    const code = params.get("code");
    const state = params.get("state");

    if (providerErr) {
      setError(
        providerErr === "access_denied"
          ? "You declined access. No changes were made."
          : `Sign-in was cancelled (${providerErr}).`,
      );
      return;
    }
    if (!provider) {
      setError("We couldn't tell which provider you used. Please try signing in again.");
      return;
    }
    if (!code || !state) {
      setError("This sign-in link is missing required information.");
      return;
    }

    completeOAuth(provider, code, state).catch((err) => {
      setError(
        isApiError(err)
          ? "We couldn't complete sign-in. The link may have expired — please try again."
          : "Something went wrong completing sign-in.",
      );
    });
  }, [params, completeOAuth]);

  return (
    <div className="grid min-h-full w-full place-items-center bg-ivory p-6">
      <div className="w-[360px] max-w-full text-center">
        <div className="flex justify-center">
          <AppLogo size="lg" />
        </div>

        {error ? (
          <>
            <h2 className="mt-8 text-2xl font-bold tracking-[-0.02em] text-ink">
              Sign-in failed
            </h2>
            <p className="mt-2 text-[14.5px] text-ink-3">{error}</p>
            <Button asChild variant="solid" size="lg" className="mt-6 h-11 w-full rounded-xl">
              <Link to={ROUTES.auth}>Back to sign in</Link>
            </Button>
          </>
        ) : (
          <>
            <div className="mt-8 flex justify-center">
              <Spinner label="Completing sign-in" />
            </div>
            <p className="mt-4 text-[14.5px] text-ink-3">Completing sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
}
