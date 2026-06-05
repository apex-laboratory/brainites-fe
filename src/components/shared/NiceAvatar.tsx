import Avatar, { genConfig } from "react-nice-avatar";

import { cn } from "@/utils/cn";

export type NiceAvatarProps = {
  name: string;
  size?: number;
  className?: string;
};

/**
 * The single avatar wrapper for every person in the app. Generates a
 * deterministic illustrated avatar from the person's name. Never use
 * initials-based avatars.
 */
export function NiceAvatar({ name, size = 34, className }: NiceAvatarProps) {
  const config = genConfig(name);

  return (
    <Avatar
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
      aria-label={name}
      {...config}
    />
  );
}
