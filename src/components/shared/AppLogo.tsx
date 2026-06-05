import { cn } from "@/utils/cn";
import { BRAND } from "@/constants/brand";

import logoLight from "@/assets/brand/brainite-exports/header-logo-transparent.png";
import logoDark from "@/assets/brand/brainite-exports/dark-variant-transparent.png";
import logoMark from "@/assets/brand/brainite-exports/favicon-transparent.png";

/**
 * Brainite brand lockup. Renders the provided transparent logo exports
 * directly (no CSS/SVG recreation):
 *  - light surfaces  → dark "brainite" wordmark lockup
 *  - dark surfaces   → cream wordmark lockup (`onDark`)
 *  - collapsed/mark  → node mark only (`markOnly`)
 */

const SIZES = {
  sm: { lockup: 22, mark: 26 },
  md: { lockup: 26, mark: 30 },
  lg: { lockup: 32, mark: 34 },
} as const;

export interface AppLogoProps {
  size?: keyof typeof SIZES;
  /** Use the light (cream) wordmark for dark brand surfaces. */
  onDark?: boolean;
  /** Render only the node mark (e.g. collapsed sidebar). */
  markOnly?: boolean;
  className?: string;
}

export function AppLogo({
  size = "md",
  onDark = false,
  markOnly = false,
  className,
}: AppLogoProps) {
  const s = SIZES[size];
  const src = markOnly ? logoMark : onDark ? logoDark : logoLight;
  const height = markOnly ? s.mark : s.lockup;

  return (
    <img
      src={src}
      alt={BRAND.name}
      height={height}
      style={{ height, width: "auto" }}
      className={cn("inline-block select-none", className)}
      draggable={false}
    />
  );
}
