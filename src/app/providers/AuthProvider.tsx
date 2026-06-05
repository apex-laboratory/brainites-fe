import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  FLOW_STORAGE_KEY,
  ROUTES,
  type FlowStage,
} from "@/constants/routes";

type AuthContextValue = {
  /** Current static flow stage, persisted to localStorage. */
  stage: FlowStage;
  /** Signup → onboarding. */
  signup: () => void;
  /** Signin → dashboard. */
  signin: () => void;
  /** Logout → auth. */
  logout: () => void;
  /** Onboarding complete → dashboard. */
  completeOnboarding: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Static auth flow per the guide. No real authentication: signup routes to
 * onboarding, signin to dashboard, logout back to auth. The active stage is
 * persisted under `heph_flow` for parity with the prototype.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [stage, setStage] = useLocalStorage<FlowStage>(
    FLOW_STORAGE_KEY,
    "auth"
  );

  const value = useMemo<AuthContextValue>(() => {
    const go = (next: FlowStage, path: string) => {
      setStage(next);
      navigate(path);
    };
    return {
      stage,
      signup: () => go("onboarding", ROUTES.onboarding),
      signin: () => go("dashboard", ROUTES.dashboard),
      logout: () => go("auth", ROUTES.auth),
      completeOnboarding: () => go("dashboard", ROUTES.dashboard),
    };
  }, [stage, setStage, navigate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
