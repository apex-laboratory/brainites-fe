import type { IconType } from "react-icons";
import {
  SiSlack,
  SiNotion,
  SiGithub,
  SiJira,
  SiZendesk,
  SiGoogle,
} from "react-icons/si";

import { cn } from "@/utils/cn";
import type { SourceId } from "@/types/common";
import { SOURCES } from "@/constants/sources";

/** Provider brand icons, resolved from `react-icons/si`. */
const SOURCE_ICON_MAP: Record<SourceId, IconType> = {
  slack: SiSlack,
  notion: SiNotion,
  github: SiGithub,
  jira: SiJira,
  zendesk: SiZendesk,
};

export interface SourceIconProps {
  id: SourceId;
  size?: number;
  /** Tint the glyph with the provider brand color. */
  branded?: boolean;
  className?: string;
}

/** Renders a provider's brand icon with an accessible label. */
export function SourceIcon({
  id,
  size = 18,
  branded = false,
  className,
}: SourceIconProps) {
  const Icon = SOURCE_ICON_MAP[id];
  const meta = SOURCES[id];
  return (
    <Icon
      role="img"
      aria-label={meta.name}
      title={meta.name}
      size={size}
      className={cn("shrink-0", className)}
      style={branded ? { color: meta.color } : undefined}
    />
  );
}

/** Standalone Google brand icon (auth screen). */
export function GoogleIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <SiGoogle
      role="img"
      aria-label="Google"
      size={size}
      className={cn("shrink-0", className)}
    />
  );
}
