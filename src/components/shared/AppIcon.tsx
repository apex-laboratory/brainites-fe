import {
  useEffect,
  useRef,
  type ForwardRefExoticComponent,
  type HTMLAttributes,
  type RefAttributes,
} from "react";

import { cn } from "@/utils/cn";

import { ArrowRightIcon } from "@/components/ui/arrow-right";
import { ArrowLeftIcon } from "@/components/ui/arrow-left";
import { ArrowUpIcon } from "@/components/ui/arrow-up";
import { SearchIcon } from "@/components/ui/search";
import { CheckIcon } from "@/components/ui/check";
import { CircleCheckIcon } from "@/components/ui/circle-check";
import { XIcon } from "@/components/ui/x";
import { PlusIcon } from "@/components/ui/plus";
import { SettingsIcon } from "@/components/ui/settings";
import { BellIcon } from "@/components/ui/bell";
import { CircleHelpIcon } from "@/components/ui/circle-help";
import { LogoutIcon } from "@/components/ui/logout";
import { ClockIcon } from "@/components/ui/clock";
import { ExternalLinkIcon } from "@/components/ui/external-link";
import { BookmarkIcon } from "@/components/ui/bookmark";
import { MapPinIcon } from "@/components/ui/map-pin";
import { ZapIcon } from "@/components/ui/zap";
import { ZapOffIcon } from "@/components/ui/zap-off";
import { SparklesIcon } from "@/components/ui/sparkles";
import { ServerIcon } from "@/components/ui/server";
import { FileTextIcon } from "@/components/ui/file-text";
import { TerminalIcon } from "@/components/ui/terminal";
import { ChevronRightIcon } from "@/components/ui/chevron-right";
import { ChevronDownIcon } from "@/components/ui/chevron-down";
import { ChevronLeftIcon } from "@/components/ui/chevron-left";
import { LinkIcon } from "@/components/ui/link";
import { SlidersHorizontalIcon } from "@/components/ui/sliders-horizontal";
import { LayoutGridIcon } from "@/components/ui/layout-grid";
import { FileCheckIcon } from "@/components/ui/file-check";
import { ClipboardCheckIcon } from "@/components/ui/clipboard-check";
import { WaypointsIcon } from "@/components/ui/waypoints";
import { BlocksIcon } from "@/components/ui/blocks";
import { GitCompareArrowsIcon } from "@/components/ui/git-compare-arrows";
import { MenuIcon } from "@/components/ui/menu";
import { BrainIcon } from "@/components/ui/brain";
import { BadgeAlertIcon } from "@/components/ui/badge-alert";
import { RefreshCWIcon } from "@/components/ui/refresh-cw";
import { SunMoonIcon } from "@/components/ui/sun-moon";
import { SquarePenIcon } from "@/components/ui/square-pen";
import { EyeIcon } from "@/components/ui/eye";
import { DeleteIcon } from "@/components/ui/delete";

/**
 * Every `@lucide-animated` component exposes the same imperative handle. The
 * generated files each declare their own identically-shaped `*IconHandle`, so
 * one structural type stands in for all of them.
 */
interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

/**
 * The shared shape of a generated icon: an element wrapping an animated `<svg>`,
 * sized by a numeric `size` prop rather than the CSS-driven `1em` react-icons
 * used.
 *
 * The registry ships these with a `<div>` root, which is invalid inside a `<p>`
 * — and icons do sit in paragraphs here (dialog descriptions, hint text). All 37
 * vendored files were switched to a `<span>` root; keep new ones consistent.
 */
type AnimatedIcon = ForwardRefExoticComponent<
  HTMLAttributes<HTMLSpanElement> & { size?: number } & RefAttributes<AnimatedIconHandle>
>;

/**
 * Central mapping of semantic UI icon names to `@lucide-animated` components
 * (`npx shadcn add @lucide-animated/<name>` drops each one in `components/ui`).
 * This file is the ONLY place generic UI icon imports are resolved — no inline
 * <svg> markup or custom-drawn paths anywhere in the app.
 *
 * The registry is a curated subset of Lucide, so six names are the nearest
 * available match rather than a like-for-like port of the heroicon they
 * replace: `warning` is a badge rather than a triangle, `database` a server
 * stack, `filter` a slider row, `sources` a node graph, `skills` a block grid,
 * and `disconnect` a struck-through bolt.
 */
const ICON_MAP = {
  arrow: ArrowRightIcon,
  arrowLeft: ArrowLeftIcon,
  arrowUp: ArrowUpIcon,
  search: SearchIcon,
  check: CheckIcon,
  checkCircle: CircleCheckIcon,
  close: XIcon,
  plus: PlusIcon,
  settings: SettingsIcon,
  bell: BellIcon,
  help: CircleHelpIcon,
  logout: LogoutIcon,
  clock: ClockIcon,
  externalLink: ExternalLinkIcon,
  bookmark: BookmarkIcon,
  pin: MapPinIcon,
  bolt: ZapIcon,
  sparkles: SparklesIcon,
  database: ServerIcon,
  document: FileTextIcon,
  command: TerminalIcon,
  chevronRight: ChevronRightIcon,
  chevronDown: ChevronDownIcon,
  chevronLeft: ChevronLeftIcon,
  link: LinkIcon,
  filter: SlidersHorizontalIcon,
  grid: LayoutGridIcon,
  decision: FileCheckIcon,
  review: ClipboardCheckIcon,
  sources: WaypointsIcon,
  skills: BlocksIcon,
  diff: GitCompareArrowsIcon,
  sidebar: MenuIcon,
  brain: BrainIcon,
  warning: BadgeAlertIcon,
  /** Disconnecting a source. Was `trash` — the registry has no trash can, and
   * a struck-through bolt reads closer to "disconnect" than a shredder would. */
  disconnect: ZapOffIcon,
  refresh: RefreshCWIcon,
  /** Light/dark mode switch. One glyph for both states — the label and
   * `aria-pressed` carry the direction, so the icon never flips mid-press. */
  theme: SunMoonIcon,
  /** Row actions on the skills registry: edit, view, and delete. */
  edit: SquarePenIcon,
  view: EyeIcon,
  delete: DeleteIcon,
} satisfies Record<string, AnimatedIcon>;

export type AppIconName = keyof typeof ICON_MAP;

/**
 * Ancestors that count as "the thing the user is hovering". An icon is almost
 * always a passenger inside one of these, and a 14px hover target of its own
 * would rarely fire — so the animation is driven from the enclosing control.
 * Add `data-icon-trigger` to opt a non-standard container in.
 */
const TRIGGER_SELECTOR =
  'button, a[href], summary, label, [role="button"], [role="tab"], [role="menuitem"], [role="option"], [data-icon-trigger]';

export interface AppIconProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  name: AppIconName;
  /**
   * Rendered px. Defaults to 16 rather than the generated components' 28 — the
   * `1em` react-icons resolved to at these call sites was ~16px, and `Button`
   * pins its icons to 16 via `[&_svg]:size-4` regardless.
   */
  size?: number;
}

/**
 * Renders a named UI icon from the shared `@lucide-animated` map.
 *
 * Attaching a ref puts the generated component into "controlled" mode, which
 * disables its own hover handling — so this drives the animation from the
 * nearest interactive ancestor instead, on both pointer hover and keyboard
 * focus. Call sites keep the plain `<AppIcon name size className />` API and
 * need to know none of that.
 */
export function AppIcon({ name, size = 16, className, ...props }: AppIconProps) {
  const Icon = ICON_MAP[name];
  const icon = useRef<AnimatedIconHandle>(null);
  // `display: contents` — a DOM anchor for `closest()` that adds no layout box,
  // so the icon still sits in its parent's flex/grid flow exactly as the bare
  // <svg> did before.
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // No interactive ancestor means the icon is decorative (an empty state, a
    // stat tile); fall back to its own box so it still responds to a direct
    // hover, which is what the uncontrolled component would have done.
    const trigger =
      node.closest<HTMLElement>(TRIGGER_SELECTOR) ??
      (node.firstElementChild as HTMLElement | null);
    if (!trigger) return;

    const start = () => icon.current?.startAnimation();
    const stop = () => icon.current?.stopAnimation();

    trigger.addEventListener("mouseenter", start);
    trigger.addEventListener("mouseleave", stop);
    trigger.addEventListener("focus", start);
    trigger.addEventListener("blur", stop);
    return () => {
      trigger.removeEventListener("mouseenter", start);
      trigger.removeEventListener("mouseleave", stop);
      trigger.removeEventListener("focus", start);
      trigger.removeEventListener("blur", stop);
    };
  }, []);

  return (
    <span ref={host} className="contents">
      <Icon
        ref={icon}
        size={size}
        aria-hidden
        className={cn("inline-flex shrink-0 items-center justify-center", className)}
        {...props}
      />
    </span>
  );
}
