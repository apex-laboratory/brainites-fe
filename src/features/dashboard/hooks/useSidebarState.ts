import { useCallback } from "react";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useIsTablet } from "@/hooks/useMediaQuery";

const SIDEBAR_STORAGE_KEY = "heph_sidebar_collapsed";

export type SidebarState = {
  /** Whether the sidebar is currently collapsed to its icon rail. */
  collapsed: boolean;
  /** Flip the collapsed state (and lock the explicit preference). */
  toggle: () => void;
};

/**
 * Owns the dashboard sidebar collapse state.
 *
 * The preference is persisted to localStorage. Until the user expresses one,
 * it follows the viewport — collapsed by default below tablet width — so the
 * shell stays usable on smaller screens without an effect syncing state.
 */
export function useSidebarState(): SidebarState {
  const isTablet = useIsTablet();
  const [pref, setPref] = useLocalStorage<boolean | null>(
    SIDEBAR_STORAGE_KEY,
    null
  );

  const collapsed = pref ?? isTablet;

  const toggle = useCallback(() => {
    setPref(!collapsed);
  }, [collapsed, setPref]);

  return { collapsed, toggle };
}
