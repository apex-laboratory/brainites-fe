import { AppLogo } from "@/components/shared/AppLogo";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/shared/AppIcon";
import { useAuth } from "@/app/providers/AuthProvider";

/**
 * Phase 1 foundation stub. The full split-screen brand/auth composition is
 * built in Phase 2 — for now it exercises the static flow wiring.
 */
export function AuthPage() {
  const { signup, signin } = useAuth();

  return (
    <div className="grid min-h-full place-items-center p-6">
      <div className="w-full max-w-sm text-center">
        <AppLogo size="lg" className="justify-center" />
        <p className="mt-4 text-sm text-ink-3">
          Your company brain. Foundation scaffolded — the auth screen lands in
          Phase 2.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" onClick={signup}>
            Create workspace
            <AppIcon name="arrow" />
          </Button>
          <Button size="lg" variant="outline" onClick={signin}>
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
