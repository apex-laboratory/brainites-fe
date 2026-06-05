import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface SetRowProps {
  label: string;
  value: string;
  /** Render the value in the monospace font (URLs, ids). */
  mono?: boolean;
}

/** A label/value settings row with an Edit affordance (prototype `SetRow`). */
export function SetRow({ label, value, mono }: SetRowProps) {
  return (
    <div className="flex items-center border-b border-line-soft py-3 last:border-b-0">
      <span className="w-44 shrink-0 text-sm text-ink-3">{label}</span>
      <span
        className={cn(
          "text-[14.5px] font-semibold text-ink",
          mono && "font-mono"
        )}
      >
        {value}
      </span>
      <Button variant="ghost" size="sm" className="ml-auto">
        Edit
      </Button>
    </div>
  );
}
