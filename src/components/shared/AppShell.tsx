import { cn } from "@/utils/cn";

export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Full-viewport app surface (port of the prototype `Stage`). Fixes the app
 * to the viewport with the warm ivory background and clips overflow so each
 * flow manages its own scrolling.
 */
export function AppShell({ children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 overflow-hidden bg-ivory text-ink",
        className
      )}
    >
      {children}
    </div>
  );
}
