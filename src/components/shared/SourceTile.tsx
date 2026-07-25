import type { SourceId } from "@/types/common";
import { cn } from "@/utils/cn";

import { AppIcon } from "./AppIcon";
import { SourceIcon } from "./SourceIcon";

export interface SourceTileProps {
  /**
   * `null` renders the neutral "no known source" tile. Decisions, reviews and
   * brain answers all carry a nullable provider, so the tile owns that case
   * rather than making each call site re-derive the placeholder.
   */
  id: SourceId | null;
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
  const glyph = iconSize ?? Math.round(size * 0.57);

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-[9px] bg-cream",
        !id && "text-ink-3",
        className
      )}
      style={{ width: size, height: size }}
    >
      {id ? (
        <SourceIcon id={id} size={glyph} branded />
      ) : (
        <AppIcon name="sparkles" size={glyph} />
      )}
    </span>
  );
}
