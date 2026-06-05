import type { IconType } from "react-icons";
import {
  SiNotion,
  SiGithub,
  SiJira,
  SiZendesk,
  SiGoogle,
} from "react-icons/si";

import { cn } from "@/utils/cn";
import type { SourceId } from "@/types/common";
import { SOURCES } from "@/constants/sources";
import slackLogo from "@/assets/brand/slack.png";

/** Provider brand icons, resolved from `react-icons/si`. Slack uses the
 * supplied full-color asset instead (handled in `SourceIcon`). */
const SOURCE_ICON_MAP: Record<Exclude<SourceId, "slack">, IconType> = {
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
  const meta = SOURCES[id];

  // Slack uses the supplied full-color logo asset (always branded).
  if (id === "slack") {
    return (
      <img
        src={slackLogo}
        role="img"
        aria-label={meta.name}
        title={meta.name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={cn("shrink-0 object-contain", className)}
        draggable={false}
      />
    );
  }

  const Icon = SOURCE_ICON_MAP[id];
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
