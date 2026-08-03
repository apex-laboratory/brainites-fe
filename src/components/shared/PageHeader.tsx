import { cn } from "@/utils/cn";

import { SectionLabel } from "./SectionLabel";

export interface PageHeaderProps {
  /** Small eyebrow label above the title. */
  label?: string;
  title: string;
  sub?: string;
  /** Right-aligned controls (filters, search, actions). */
  right?: React.ReactNode;
  className?: string;
}

/**
 * Shared dashboard page header (the prototype `PageHead`): eyebrow label,
 * title, optional sub copy, and a right-aligned controls slot.
 */
export function PageHeader({
  label,
  title,
  sub,
  right,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-4 border-b border-line-soft px-6 py-6 md:px-10",
        className
      )}
    >
      <div className="min-w-0">
        {label && <SectionLabel className="mb-2 pb-0">{label}</SectionLabel>}
        <h1 className="font-display text-[31px] font-normal leading-[1.05] tracking-[0.015em] text-ink md:text-[35px]">
          {title}
        </h1>
        {sub && <p className="mt-1.5 text-sm text-ink-3 md:text-[14.5px]">{sub}</p>}
      </div>
      {right && <div className="ml-auto flex items-center gap-2.5">{right}</div>}
    </div>
  );
}
