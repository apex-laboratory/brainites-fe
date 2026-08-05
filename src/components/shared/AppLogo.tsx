import { cn } from "@/utils/cn";
import { BRAND } from "@/constants/brand";

import logoLight from "@/assets/brand/brainite-exports/header-logo-transparent.png";
import logoDark from "@/assets/brand/brainite-exports/dark-variant-transparent.png";
import logoMark from "@/assets/brand/brainite-exports/favicon-transparent.png";
import logoMarkDark from "@/assets/brand/brainite-exports/mark-dark-transparent.png";

/**
 * Brainite brand lockup. Renders the provided transparent logo exports
 * directly (no CSS/SVG recreation):
 *  - light surfaces  → dark "brainite" wordmark lockup
 *  - dark surfaces   → cream wordmark lockup (`onDark`)
 *  - collapsed/mark  → node mark only (`markOnly`), which also honours
 *    `onDark`: the default mark's nodes are near-black and disappear on a
 *    dark surface, so `mark-dark-transparent.png` carries the cream nodes.
 */

const SIZES = {
  sm: { lockup: 38, mark: 30 },
  md: { lockup: 44, mark: 44 },
  lg: { lockup: 64, mark: 54 },
  xl: { lockup: 60, mark: 60 },
} as const;

/**
 * Intrinsic aspect ratios (width ÷ height) of the exported assets. We derive a
 * definite pixel width from the rendered height so the image always keeps its
 * proportions — even as a flex/grid child, where `width: auto` would otherwise
 * get stretched to the container by `align-items: stretch`.
 */
const RATIO = {
  light: 590 / 256,
  dark: 1194 / 480,
  mark: 1,
} as const;

/**
 * Fraction of each asset's width that is transparent padding on the left. With
 * `flush`, we offset the image by this much so the visible glyph's left edge
 * lines up with adjacent text instead of the asset's invisible bounding box.
 */
const LEFT_PAD = {
  light: 74 / 590,
  dark: 120 / 1194,
  mark: 0,
} as const;

export interface AppLogoProps {
  size?: keyof typeof SIZES;
  /** Use the light (cream) wordmark for dark brand surfaces. */
  onDark?: boolean;
  /** Render only the node mark (e.g. collapsed sidebar). */
  markOnly?: boolean;
  /** Cancel the asset's transparent left padding so the visible glyph aligns
   * to the container's left edge (e.g. flush with a heading below it). */
  flush?: boolean;
  className?: string;
}

export function AppLogo({
  size = "md",
  onDark = false,
  markOnly = false,
  flush = false,
  className,
}: AppLogoProps) {
  const s = SIZES[size];
  const variant = markOnly ? "mark" : onDark ? "dark" : "light";
  const src = markOnly
    ? onDark
      ? logoMarkDark
      : logoMark
    : onDark
      ? logoDark
      : logoLight;
  const height = markOnly ? s.mark : s.lockup;
  const width = Math.round(height * RATIO[variant]);
  const marginLeft = flush ? -Math.round(width * LEFT_PAD[variant]) : undefined;

  return (
    <img
      src={src}
      alt={BRAND.name}
      width={width}
      height={height}
      style={{ height, width, marginLeft }}
      className={cn("inline-block max-w-full select-none", className)}
      draggable={false}
    />
  );
}
