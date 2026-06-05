import { Badge, type BadgeProps } from "@/components/ui/badge";

/** Any status string the dashboard surfaces (decisions + skills). */
export type StatusKey =
  | "approved"
  | "active"
  | "review"
  | "stable"
  | "draft"
  | string;

const STATUS_STYLE: Record<
  string,
  { variant: BadgeProps["variant"]; label: string }
> = {
  approved: { variant: "green", label: "Approved" },
  active: { variant: "accent", label: "Active" },
  review: { variant: "amber", label: "Needs review" },
  stable: { variant: "green", label: "Stable" },
  draft: { variant: "outline", label: "Draft" },
};

export interface StatusBadgeProps {
  status: StatusKey;
  className?: string;
}

/**
 * Square status badge (replaces the prototype's `.tag` pill). The text label
 * carries meaning so it never relies on color alone.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLE[status] ?? { variant: "default", label: status };
  return (
    <Badge variant={style.variant} className={className}>
      {style.label}
    </Badge>
  );
}
