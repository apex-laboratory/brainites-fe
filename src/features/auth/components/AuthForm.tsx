import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLogo } from "@/components/shared/AppLogo";
import { GoogleIcon } from "@/components/shared/SourceIcon";
import { BRAND } from "@/constants/brand";
import { useAuth } from "@/app/providers/AuthProvider";
import { useAuthMode } from "@/features/auth/hooks/useAuthMode";

/** Right-hand auth form: Google OAuth, email + password, signup/signin
 * toggle. No real auth — signup routes to onboarding, signin to the
 * dashboard via the flow provider. */
export function AuthForm() {
  const { signup, signin } = useAuth();
  const { isSignup, toggle } = useAuthMode("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Static flow: continue acts as signup or signin depending on mode.
  const go = () => (isSignup ? signup() : signin());

  return (
    <div className="flex flex-1 items-center justify-center bg-paper-2 px-6 py-12 sm:px-12">
      <div className="w-[360px] max-w-full motion-safe:animate-fade-up">
        <AppLogo size="md" />

        <h2 className="mt-8 text-[28px] font-bold tracking-tight text-ink">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mt-1.5 text-[14.5px] text-ink-3">
          {isSignup
            ? `Start building your company brain on ${BRAND.name}.`
            : `Sign in to continue to ${BRAND.name}.`}
        </p>

        <Button
          variant="solid"
          size="lg"
          className="mt-7 h-12 w-full rounded-xl text-[14.5px]"
          onClick={go}
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
              className="h-11"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-[7px] flex items-center justify-between">
              <label
                htmlFor="auth-password"
                className="block text-[13px] font-semibold text-ink-2"
              >
                Password
              </label>
              {!isSignup && (
                <button
                  type="button"
                  onClick={go}
                  className="text-[12.5px] font-semibold text-brand-ink hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <Input
              id="auth-password"
              type="password"
              className="h-11"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
            />
          </div>

          {!isSignup && (
            <label className="flex select-none items-center gap-2 text-[13.5px] text-ink-2">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-line-2 accent-[var(--solid)]"
              />
              Remember me
            </label>
          )}

          <Button
            variant="solid"
            size="lg"
            className="mt-1 h-12 w-full rounded-xl"
            onClick={go}
          >
            {isSignup ? "Create account" : "Sign in"}
          </Button>
        </div>

        <p className="mt-7 text-center text-[13.5px] text-ink-3">
          {isSignup ? "Already have an account? " : `New to ${BRAND.name}? `}
          <button
            type="button"
            onClick={toggle}
            className="font-semibold text-brand-ink hover:underline"
          >
            {isSignup ? "Sign in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}
