import { useState } from "react";
import { FaGithub } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppIcon } from "@/components/shared/AppIcon";
import { GoogleIcon } from "@/components/shared/SourceIcon";
import { useAuth } from "@/app/providers/AuthProvider";
import { useAuthMode } from "@/features/auth/hooks/useAuthMode";

/** Right-hand auth form: OAuth, email, SAML SSO. No real auth — signup
 * routes to onboarding and signin to the dashboard via the flow provider. */
export function AuthForm() {
  const { signup, signin } = useAuth();
  const { isSignup, toggle } = useAuthMode();
  const [email, setEmail] = useState("");

  // Static flow: continue acts as signup or signin depending on mode.
  const go = () => (isSignup ? signup() : signin());

  return (
    <div className="relative flex flex-1 items-center justify-center p-10">
      <div className="absolute right-9 top-7 whitespace-nowrap text-[13.5px] text-ink-3">
        {isSignup ? "Have an account? " : "New here? "}
        <button
          type="button"
          onClick={toggle}
          className="font-semibold text-brand-ink hover:underline"
        >
          {isSignup ? "Sign in" : "Create account"}
        </button>
      </div>

      <div className="w-[384px] max-w-full motion-safe:animate-fade-up">
        <h2 className="text-[31px] font-bold tracking-tight text-ink">
          {isSignup ? "Create your workspace" : "Welcome back"}
        </h2>
        <p className="mt-2 text-[15px] text-ink-3">
          {isSignup
            ? "Build your company brain in about two minutes."
            : "Pick up where your brain left off."}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-xl text-[14.5px]"
            onClick={go}
          >
            <GoogleIcon size={18} />
            Continue with Google
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-xl text-[14.5px]"
            onClick={go}
          >
            <FaGithub size={18} />
            Continue with GitHub
          </Button>
        </div>

        <div className="my-5 flex items-center gap-3.5">
          <div className="h-px flex-1 bg-line-2" />
          <span className="text-xs font-semibold text-ink-4">or</span>
          <div className="h-px flex-1 bg-line-2" />
        </div>

        <div className="flex flex-col gap-2.5">
          <div>
            <label
              htmlFor="auth-email"
              className="mb-[7px] block text-[13px] font-semibold text-ink-2"
            >
              Work email
            </label>
            <Input
              id="auth-email"
              type="email"
              className="h-11"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
            />
          </div>
          <Button
            size="lg"
            className="mt-1 h-12 w-full rounded-xl"
            onClick={go}
          >
            {isSignup ? "Create account" : "Sign in"}
            <AppIcon name="arrow" />
          </Button>
        </div>

        <button
          type="button"
          onClick={go}
          className="mt-4 flex w-full items-center justify-center gap-[7px] whitespace-nowrap text-[13.5px] font-medium text-ink-3 hover:text-ink"
        >
          <AppIcon name="skills" size={15} /> Continue with SAML SSO
        </button>

        <div className="mt-7 flex items-center justify-center gap-[7px] text-[12.5px] text-ink-4">
          <AppIcon name="review" size={14} className="flex-none" /> Read-only ·
          SOC 2 Type II · We never write to your tools
        </div>
        <p className="mt-3 text-center text-[11.5px] leading-[1.5] text-ink-4">
          By continuing you agree to {""}
          <span className="font-medium">Brainite&apos;s</span> Terms &amp;
          Privacy Policy.
        </p>
      </div>
    </div>
  );
}
