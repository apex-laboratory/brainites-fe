import { useCallback, useMemo, useState } from "react";

import type { AuthMode } from "@/features/auth/types";

/** Manages the signup/signin toggle on the auth screen. */
export function useAuthMode(initial: AuthMode = "signup") {
  const [mode, setMode] = useState<AuthMode>(initial);

  const toggle = useCallback(
    () => setMode((m) => (m === "signup" ? "signin" : "signup")),
    []
  );

  return useMemo(
    () => ({ mode, isSignup: mode === "signup", setMode, toggle }),
    [mode, toggle]
  );
}
