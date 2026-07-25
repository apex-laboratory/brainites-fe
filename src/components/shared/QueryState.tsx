import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isApiError } from "@/lib/api";
import { cn } from "@/utils/cn";

import { AppIcon, type AppIconName } from "./AppIcon";

/**
 * Shared read-state surfaces. Query (read) failures render inline where the
 * data would be — never a toast, never a blank screen. Mutation outcomes keep
 * using toasts (see `queryClient`'s global `onError`).
 */

export interface ErrorStateProps {
  /** The thrown value from a `useQuery`. `ApiError` messages are surfaced verbatim. */
  error: unknown;
  onRetry?: () => void;
  /** Shown above the message. */
  title?: string;
  className?: string;
}

/** Inline error card with the failure reason and a retry affordance. */
export function ErrorState({
  error,
  onRetry,
  title = "Couldn't load this",
  className,
}: ErrorStateProps) {
  const message = isApiError(error)
    ? error.message
    : "Something went wrong. Please try again.";

  return (
    <Card className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <span className="grid size-10 place-items-center rounded-full bg-amber-soft text-amber">
        <AppIcon name="warning" size={20} />
      </span>
      <div className="mt-3.5 text-[15px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </div>
      <p className="mt-1 max-w-[380px] text-[13px] text-ink-3">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <AppIcon name="refresh" size={14} />
          Retry
        </Button>
      )}
    </Card>
  );
}

export interface EmptyStateProps {
  icon?: AppIconName;
  title: string;
  sub?: string;
  /** Primary affordance, e.g. an "Add source" button. */
  action?: ReactNode;
  className?: string;
}

/** Inline empty card for a successful query that returned nothing. */
export function EmptyState({
  icon = "sparkles",
  title,
  sub,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <span className="grid size-10 place-items-center rounded-full bg-cream text-ink-2">
        <AppIcon name={icon} size={20} />
      </span>
      <div className="mt-3.5 text-[15px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </div>
      {sub && <p className="mt-1 max-w-[380px] text-[13px] text-ink-3">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}

export interface SpinnerProps {
  /** Diameter in px. */
  size?: number;
  /** `brand` reads on light surfaces, `light` on dark ones. */
  tone?: "brand" | "light";
  /**
   * Accessible label. Provide it when the spinner is the only thing announcing
   * the wait; omit it for one sitting inside already-labelled copy, which makes
   * the spinner decorative.
   */
  label?: string;
  className?: string;
}

/** The app's one loading spinner. */
export function Spinner({ size = 24, tone = "brand", label, className }: SpinnerProps) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: size, height: size }}
      className={cn(
        "block shrink-0 rounded-full border-2 motion-safe:animate-spin",
        tone === "brand"
          ? "border-line border-t-brand-ink"
          : "border-white/30 border-t-white",
        className,
      )}
    />
  );
}

/** Neutral shimmer block used to compose per-list loading skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("motion-safe:animate-pulse rounded-md bg-cream", className)}
      aria-hidden
    />
  );
}
