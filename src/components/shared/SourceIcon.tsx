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
import googleDriveLogo from "@/assets/google-drive.png";

/** Sources rendered from a supplied full-color image asset rather than a
 * `react-icons/si` glyph. */
const SOURCE_IMG_MAP = {
  slack: slackLogo,
  googledrive: googleDriveLogo,
} satisfies Partial<Record<SourceId, string>>;

type ImgSourceId = keyof typeof SOURCE_IMG_MAP;

/** Provider brand icons, resolved from `react-icons/si`. Image-backed sources
 * (see `SOURCE_IMG_MAP`) are handled separately in `SourceIcon`. */
const SOURCE_ICON_MAP: Record<Exclude<SourceId, ImgSourceId>, IconType> = {
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

  // Image-backed sources use their supplied full-color logo asset (always
  // branded), e.g. Slack and Google Drive.
  if (id in SOURCE_IMG_MAP) {
    return (
      <img
        src={SOURCE_IMG_MAP[id as ImgSourceId]}
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

  const Icon = SOURCE_ICON_MAP[id as Exclude<SourceId, ImgSourceId>];
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
