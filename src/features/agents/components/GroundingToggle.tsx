import { AppIcon } from "@/components/shared";
import { cn } from "@/utils/cn";

export interface GroundingToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

/**
 * The `query_brain` grounding switch.
 *
 * On by default, and worth its own component rather than a checkbox in a row of
 * fields: grounding is the reason this product's agent builder is not the same
 * as anyone else's. The copy says what it actually does, because "ground in
 * brain" means nothing to someone who has not read the plan.
 *
 * **The flag is stored but not yet wired.** Attaching our MCP server to an agent
 * needs the workspace vault (backend phase 2) and a public MCP ingress, so
 * today this saves a preference and changes nothing about how the agent runs.
 * The note below says so rather than implying a capability that isn't there —
 * a toggle that silently does nothing is worse than one that admits it.
 */
export function GroundingToggle({ value, onChange, disabled }: GroundingToggleProps) {
  return (
    <div className="rounded-lg border p-4">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={cn(
          "flex w-full items-start gap-3 text-left",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
            value ? "bg-primary" : "bg-muted-foreground/30",
          )}
        >
          <span
            className={cn(
              "h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
              value && "translate-x-4",
            )}
          />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <AppIcon name="brain" size={14} />
            Ground answers in your brain
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            The agent looks up your company&apos;s reviewed skills before it acts, instead of
            guessing from general knowledge.
          </span>
        </span>
      </button>

      {value && (
        <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
          Not active yet — grounding turns on once this workspace&apos;s brain endpoint is
          published. Your preference is saved.
        </p>
      )}
    </div>
  );
}
