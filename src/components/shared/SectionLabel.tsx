import { cn } from "@/utils/cn";

export interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Small sans uppercase label with modest tracking — the replacement for
 * the prototype's `.mono` section labels. No monospace, no negative
 * letter spacing.
 */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "text-[11px] font-semibold uppercase tracking-wide text-ink-4",
        className
      )}
    >
      {children}
    </div>
  );
}
