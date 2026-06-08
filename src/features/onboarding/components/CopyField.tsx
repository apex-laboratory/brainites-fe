import type { ReactNode } from "react";

import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";

/** Compact copy button used on the dark integration surfaces. */
function CopyButton({
  onClick,
  label = "Copy",
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className={`h-[30px] flex-none bg-white/10 text-solid-ink shadow-none hover:bg-white/20 ${className ?? ""}`}
    >
      <AppIcon name="link" size={13} />
      {label}
    </Button>
  );
}

/** Single-line dark field with a copy action (endpoint, API key). */
export function CopyRow({
  value,
  onCopy,
  trailing,
}: {
  value: string;
  onCopy: () => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-[11px] bg-solid px-4 py-3">
      <span className="tnum min-w-0 flex-1 truncate font-mono text-[13px] text-solid-ink">
        {value}
      </span>
      {trailing}
      <CopyButton onClick={onCopy} />
    </div>
  );
}

/**
 * Multi-line dark code block. With a `title` it gets a header bar (label +
 * copy); without one the copy button floats in the top-right corner.
 */
export function CopyBlock({
  value,
  onCopy,
  title,
  rows = 8,
}: {
  value: string;
  onCopy: () => void;
  title?: string;
  rows?: number;
}) {
  const pre = (
    <pre
      className="scroll-y max-h-[300px] overflow-auto whitespace-pre-wrap font-mono text-[12.5px] leading-[1.6] text-solid-ink"
      style={{ minHeight: `${rows * 1.6}em` }}
    >
      {value}
    </pre>
  );

  if (title) {
    return (
      <div className="overflow-hidden rounded-[11px] bg-solid">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
          <span className="truncate font-mono text-[12px] text-solid-ink opacity-70">
            {title}
          </span>
          <CopyButton onClick={onCopy} />
        </div>
        <div className="p-4">{pre}</div>
      </div>
    );
  }

  return (
    <div className="relative rounded-[11px] bg-solid p-4">
      <CopyButton onClick={onCopy} className="absolute right-3 top-3 z-10" />
      <div className="pr-[84px]">{pre}</div>
    </div>
  );
}
