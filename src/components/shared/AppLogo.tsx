import { cn } from "@/utils/cn";
import { BRAND } from "@/constants/brand";
import { AppIcon } from "@/components/shared/AppIcon";

/**
 * TODO(brand): Replace this temporary text lockup with the real Brainite
 * logo asset once it is provided. Drop the file at
 * `src/assets/brand/brainite-logo.png` (see `LOGO_ASSET_PATH`) and swap the
 * mark below for an <img>. Per the guide, the logo must not be recreated in
 * CSS/SVG long-term — this lockup is an explicitly-allowed placeholder.
 */

const SIZES = {
  sm: { mark: "size-7 rounded-md", glyph: 15, word: "text-[17px]" },
  md: { mark: "size-8 rounded-md", glyph: 17, word: "text-[19px]" },
  lg: { mark: "size-9 rounded-lg", glyph: 19, word: "text-[22px]" },
} as const;

export interface AppLogoProps {
  size?: keyof typeof SIZES;
  /** Render light text for dark brand surfaces. */
  onDark?: boolean;
  /** Hide the wordmark, showing only the mark (collapsed sidebar). */
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
  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={BRAND.name}
    >
      <span
        className={cn(
          "grid place-items-center bg-primary text-primary-foreground shadow-soft-1",
          s.mark
        )}
      >
        <AppIcon name="brain" size={s.glyph} />
      </span>
      {!markOnly && (
        <span
          className={cn(
            "font-bold lowercase tracking-tight",
            s.word,
            onDark ? "text-solid-ink" : "text-ink"
          )}
        >
          {BRAND.name.toLowerCase()}
        </span>
      )}
    </span>
  );
}
