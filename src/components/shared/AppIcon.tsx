import type { IconBaseProps, IconType } from "react-icons";
import {
  HiArrowRight,
  HiArrowLeft,
  HiArrowUp,
  HiMagnifyingGlass,
  HiCheck,
  HiCheckCircle,
  HiXMark,
  HiPlus,
  HiCog6Tooth,
  HiBell,
  HiQuestionMarkCircle,
  HiArrowRightOnRectangle,
  HiClock,
  HiArrowTopRightOnSquare,
  HiBookmark,
  HiBolt,
  HiSparkles,
  HiCircleStack,
  HiDocumentText,
  HiCommandLine,
  HiChevronRight,
  HiChevronDown,
  HiChevronLeft,
  HiLink,
  HiFunnel,
  HiSquares2X2,
  HiClipboardDocumentCheck,
  HiClipboardDocumentList,
  HiBars3,
  HiViewColumns,
  HiArrowsRightLeft,
  HiMapPin,
  HiShare,
  HiExclamationTriangle,
  HiTrash,
  HiArrowPath,
} from "react-icons/hi2";
import { FaBrain } from "react-icons/fa6";

/**
 * Central mapping of semantic UI icon names to `react-icons` components.
 * This file is the ONLY place generic UI icon imports are resolved — no
 * inline <svg> markup or custom-drawn paths anywhere in the app.
 */
const ICON_MAP = {
  arrow: HiArrowRight,
  arrowLeft: HiArrowLeft,
  arrowUp: HiArrowUp,
  search: HiMagnifyingGlass,
  check: HiCheck,
  checkCircle: HiCheckCircle,
  close: HiXMark,
  plus: HiPlus,
  settings: HiCog6Tooth,
  bell: HiBell,
  help: HiQuestionMarkCircle,
  logout: HiArrowRightOnRectangle,
  clock: HiClock,
  externalLink: HiArrowTopRightOnSquare,
  bookmark: HiBookmark,
  pin: HiMapPin,
  bolt: HiBolt,
  sparkles: HiSparkles,
  database: HiCircleStack,
  document: HiDocumentText,
  command: HiCommandLine,
  chevronRight: HiChevronRight,
  chevronDown: HiChevronDown,
  chevronLeft: HiChevronLeft,
  link: HiLink,
  filter: HiFunnel,
  grid: HiSquares2X2,
  decision: HiClipboardDocumentCheck,
  review: HiClipboardDocumentList,
  sources: HiShare,
  skills: HiViewColumns,
  diff: HiArrowsRightLeft,
  sidebar: HiBars3,
  brain: FaBrain,
  warning: HiExclamationTriangle,
  trash: HiTrash,
  refresh: HiArrowPath,
} satisfies Record<string, IconType>;

export type AppIconName = keyof typeof ICON_MAP;

export interface AppIconProps extends IconBaseProps {
  name: AppIconName;
}

/** Renders a named UI icon from the shared `react-icons` map. */
export function AppIcon({ name, ...props }: AppIconProps) {
  const Icon = ICON_MAP[name];
  return <Icon aria-hidden {...props} />;
}
