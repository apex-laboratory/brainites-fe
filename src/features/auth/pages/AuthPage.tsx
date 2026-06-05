import { AuthBrandPanel } from "@/features/auth/components/AuthBrandPanel";
import { AuthForm } from "@/features/auth/components/AuthForm";

/**
 * Split-screen auth: living brand panel on the left (lg+), auth form on the
 * right. Below lg the brand panel collapses and the form fills the width.
 */
export function AuthPage() {
  return (
    <div className="flex min-h-full w-full bg-ivory">
      <AuthBrandPanel />
      <AuthForm />
    </div>
  );
}
