import type { SourceId } from "@/types/common";
import { cn } from "@/utils/cn";

import { SourceIcon } from "./SourceIcon";

export interface SourceTileProps {
  id: SourceId;
  /** Square size in px. */
  size?: number;
  /** Glyph size in px (defaults to ~57% of the tile). */
  iconSize?: number;
  className?: string;
}

/**
 * A source's brand icon on a cream rounded square — the repeated avatar-style
 * mark used in decision rows, review rows and source cards.
 */
export function SourceTile({ id, size = 34, iconSize, className }: SourceTileProps) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-[9px] bg-cream",
        className
      )}
      style={{ width: size, height: size }}
    >
      <SourceIcon id={id} size={iconSize ?? Math.round(size * 0.57)} branded />
    </span>
  );
}
