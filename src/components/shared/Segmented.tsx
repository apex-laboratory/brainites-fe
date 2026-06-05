import { cn } from "@/utils/cn";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export interface SegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  /** Accessible label for the control group. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Controlled segmented control (the prototype `.seg`). Built on buttons with
 * a radiogroup role; the active option gets a raised paper surface.
 */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex gap-0.5 rounded-md bg-cream p-[3px]",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8 whitespace-nowrap rounded-[6px] px-3.5 text-[13px] font-semibold tracking-[-0.01em] transition-colors",
              active
                ? "bg-paper-2 text-ink shadow-soft-1"
                : "text-ink-3 hover:text-ink"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
