import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { useLocalStorage } from "@/hooks/useLocalStorage";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Applies theme state to the document root via `data-*` attributes, mirroring
 * the prototype's tweak system. Tokens in globals.css react to `data-mode`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useLocalStorage<ThemeMode>("brainite_mode", "light");

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mode = mode;
    // Static defaults carried over from the prototype tweak system.
    root.dataset.accent = "quiet";
    root.dataset.density = "regular";
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode(mode === "light" ? "dark" : "light"),
    }),
    [mode, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
