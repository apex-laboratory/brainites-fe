import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLogo } from "@/components/shared/AppLogo";
import { GoogleIcon } from "@/components/shared/SourceIcon";
import { BRAND } from "@/constants/brand";
import { useAuth } from "@/app/providers/AuthProvider";
import { useAuthMode } from "@/features/auth/hooks/useAuthMode";
import { EmailSchema } from "@/features/auth/api";
import { isApiError } from "@/lib/api";

/**
 * Passwordless email auth. Email + "Continue" runs signup or signin (per the
 * toggle), or "Continue with Google" starts OAuth SSO. The AuthProvider routes
 * onward per the server's `nextStep`. Errors render inline; the submit button
 * reflects the in-flight state.
 */
export function AuthForm() {
  const { signup, signin, signInWithOAuth } = useAuth();
  const { isSignup, mode, toggle } = useAuthMode("signin");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);

    const parsed = EmailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }

    setPending(true);
    try {
      await (isSignup ? signup(parsed.data) : signin(parsed.data));
      // On success the provider navigates away; no further state needed.
    } catch (err) {
      setError(resolveAuthError(err, isSignup));
      setPending(false);
    }
  }

  async function handleGoogle() {
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      await signInWithOAuth("google", mode);
      // Redirects the browser away on success.
    } catch (err) {
      setError(resolveAuthError(err, isSignup));
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-paper-2 px-6 py-12 sm:px-12">
      <form
        onSubmit={handleSubmit}
        className="w-[360px] max-w-full motion-safe:animate-fade-up"
        noValidate
      >
        <AppLogo size="lg" flush />

        <h2 className="mt-8 font-logo text-[34px] font-normal leading-[1.05] text-ink md:text-[40px]">
          {isSignup ? "Create your account" : "Welcome back"}
          <span className="text-[#C2410C]">.</span>
        </h2>
        <p className="mt-1.5 text-[14.5px] text-ink-3">
          {isSignup
            ? `Start building your company brain on ${BRAND.name}.`
            : `Sign in to continue to ${BRAND.name}.`}
        </p>

        <Button
          type="button"
          variant="solid"
          size="lg"
          className="mt-7 h-12 w-full rounded-xl text-[14.5px]"
          onClick={handleGoogle}
          disabled={pending}
        >
          <GoogleIcon size={18} />
          Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-3.5">
          <div className="h-px flex-1 bg-line-2" />
          <span className="text-xs font-semibold text-ink-4">or</span>
          <div className="h-px flex-1 bg-line-2" />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="auth-email"
              className="mb-[7px] block text-[13px] font-semibold text-ink-2"
            >
              Email address
            </label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              className="h-11"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "auth-error" : undefined}
            />
          </div>

          {error && (
            <p id="auth-error" role="alert" className="text-[13px] font-medium text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="solid"
            size="lg"
            className="mt-1 h-12 w-full rounded-xl"
            disabled={pending}
          >
            {pending
              ? isSignup
                ? "Creating account…"
                : "Signing in…"
              : isSignup
                ? "Create account"
                : "Continue with email"}
          </Button>
        </div>

        <p className="mt-7 text-center text-[13.5px] text-ink-3">
          {isSignup ? "Already have an account? " : `New to ${BRAND.name}? `}
          <button
            type="button"
            onClick={() => {
              setError(null);
              toggle();
            }}
            className="font-semibold text-brand-ink hover:underline"
          >
            {isSignup ? "Sign in" : "Create an account"}
          </button>
        </p>
      </form>
    </div>
  );
}

/** Map an auth failure to a friendly, mode-aware message. */
function resolveAuthError(err: unknown, isSignup: boolean): string {
  if (isApiError(err)) {
    if (err.code === "conflict") {
      return "That email is already registered. Try signing in instead.";
    }
    if (err.code === "not_found") {
      return "No account found for that email. Create one to get started.";
    }
    if (err.code === "validation_error") {
      return err.details?.[0]?.message ?? "Please check your email and try again.";
    }
    if (err.code === "rate_limited") {
      return "Too many attempts. Please wait a moment and try again.";
    }
    if (err.code === "network_error" || err.code === "timeout") {
      return "Couldn't reach the server. Check your connection and try again.";
    }
    return err.message;
  }
  return isSignup
    ? "Couldn't create your account. Please try again."
    : "Couldn't sign you in. Please try again.";
}
