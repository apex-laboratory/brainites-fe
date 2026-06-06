import { AuthBrandPanel } from "@/features/auth/components/AuthBrandPanel";
import { AuthForm } from "@/features/auth/components/AuthForm";

/**
 * Split-screen auth framed as a single rounded card on the ivory canvas:
 * navy brand panel on the left (lg+), auth form on the right. Below lg the
 * brand panel collapses and the form fills the card.
 */
export function AuthPage() {
  return (
    <div className="flex min-h-full w-full items-center justify-center bg-ivory p-4 sm:p-6 lg:p-8">
      <div className="flex min-h-[720px] w-full max-w-[1220px] overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-soft-3">
        <AuthBrandPanel />
        <AuthForm />
      </div>
    </div>
  );
}
