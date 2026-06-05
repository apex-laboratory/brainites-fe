import { useEffect, useState } from "react";

/** Tracks whether a CSS media query currently matches. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Convenience breakpoints aligned with the responsive guidance. */
export const useIsTablet = () => useMediaQuery("(max-width: 1024px)");
export const useIsMobile = () => useMediaQuery("(max-width: 640px)");
