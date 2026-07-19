import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ROUTES } from "@/constants/routes";
import {
  authApi,
  type AuthRole,
  type MeWorkspace,
  type OAuthMode,
  type OAuthProvider,
  type Session,
  type User,
  type WorkspaceSummary,
} from "@/features/auth/api";
import {
  clearTokens,
  getRefreshToken,
  hasSession,
  isApiError,
  onSessionExpired,
  queryClient,
  refreshTokens,
  setTokens,
} from "@/lib/api";

/** A 401 during rehydrate means the refresh token is dead — sign out. Any other
 * failure (5xx, network) is transient and must not evict a live session. */
function isUnauthorized(err: unknown): boolean {
  return isApiError(err) && err.status === 401;
}

/** Lifecycle of the session, drives route guards and loading gates. */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

/**
 * The display-only slice of the session persisted to localStorage so the shell
 * can paint the user/workspace instantly on reload, before the network settles.
 * It carries NO tokens — the access token lives in memory and the refresh token
 * is stored separately by the token layer.
 *
 * This is a *cache*, not the source of truth: on reload we refresh the access
 * token and then call `GET /auth/me` for authoritative identity, overwriting the
 * snapshot (see BE_AUTH_QUESTIONS.md §3). The snapshot is only trusted as a
 * fallback when `/auth/me` is unreachable but the refresh itself succeeded.
 */
interface SessionSnapshot {
  user: User;
  workspace: MeWorkspace | null;
  role: AuthRole | null;
}

const SESSION_SNAPSHOT_KEY = "brainite.session";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  workspace: MeWorkspace | null;
  workspaceId: string | null;
  /** The user's role in the active workspace; `null` before onboarding or
   * until the first `/auth/me` on reload resolves it. */
  role: AuthRole | null;
  isAuthenticated: boolean;
  /** Passwordless email sign-up → routes per the server's `nextStep`. */
  signup: (email: string) => Promise<void>;
  /** Passwordless email sign-in → routes per the server's `nextStep`. */
  signin: (email: string) => Promise<void>;
  /** Begin OAuth SSO: fetch the consent URL and redirect the browser. */
  signInWithOAuth: (provider: OAuthProvider, mode?: OAuthMode) => Promise<void>;
  /** Finish OAuth SSO from the provider redirect (called by the callback page). */
  completeOAuth: (
    provider: OAuthProvider,
    code: string,
    state: string,
  ) => Promise<void>;
  /** Revoke the session and return to the auth screen. */
  logout: () => void;
  /**
   * Adopt a freshly created workspace mid-onboarding: swap in the
   * workspace-scoped access token and record the workspace so
   * `useWorkspaceId()` / `RequireWorkspace` resolve. Does NOT navigate.
   */
  activateWorkspace: (workspace: WorkspaceSummary, accessToken: string) => void;
  /** Onboarding finished → dashboard. */
  completeOnboarding: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Real, token-backed auth. Keeps the small public surface the app already
 * consumes (`signup` / `signin` / `logout` / `completeOnboarding`) while adding
 * session state, OAuth SSO, and silent refresh-based rehydration on reload.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useLocalStorage<SessionSnapshot | null>(
    SESSION_SNAPSHOT_KEY,
    null,
  );
  const [status, setStatus] = useState<AuthStatus>(() =>
    hasSession() ? "loading" : "unauthenticated",
  );

  const applySession = useCallback(
    (session: Session) => {
      setTokens({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });
      // The signin/signup/oauth session carries no `role` — it's resolved by
      // `/auth/me` on the next reload. Seed it `null` until then.
      setSnapshot({
        user: session.user,
        workspace: session.workspace,
        role: null,
      });
      setStatus("authenticated");
    },
    [setSnapshot],
  );

  const clearSession = useCallback(() => {
    clearTokens();
    setSnapshot(null);
    setStatus("unauthenticated");
    queryClient.clear();
  }, [setSnapshot]);

  // ── Rehydrate on mount ────────────────────────────────────────────────────
  // If a refresh token survives in storage, silently mint a fresh access token,
  // then pull authoritative identity from `GET /auth/me` and overwrite the
  // cached snapshot. Runs once.
  const didHydrate = useRef(false);
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;

    let active = true;
    if (hasSession() && snapshot) {
      refreshTokens()
        .then(() => authApi.me())
        .then((me) => {
          if (!active) return;
          // `/auth/me` is the source of truth — replace the cached snapshot.
          setSnapshot({ user: me.user, workspace: me.workspace, role: me.role });
          setStatus("authenticated");
        })
        .catch((err) => {
          if (!active) return;
          // A dead/expired refresh token surfaces as a 401 and `refreshTokens`
          // has already cleared state + emitted `onSessionExpired`; fall through
          // to unauthenticated. But if the *refresh* succeeded and only `/auth/me`
          // failed (transient 5xx / offline), keep the cached snapshot so a blip
          // doesn't sign the user out.
          if (isUnauthorized(err) || !hasSession()) {
            setStatus("unauthenticated");
          } else {
            setStatus("authenticated");
          }
        });
    } else {
      if (hasSession() || snapshot) clearSession();
      setStatus("unauthenticated");
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── React to a failed refresh anywhere in the app ─────────────────────────
  useEffect(
    () =>
      onSessionExpired(() => {
        setSnapshot(null);
        setStatus("unauthenticated");
        queryClient.clear();
        toast.error("Your session expired. Please sign in again.");
        navigate(ROUTES.auth);
      }),
    [navigate, setSnapshot],
  );

  const routeForNextStep = useCallback(
    (session: Session) =>
      navigate(
        session.nextStep === "dashboard" ? ROUTES.dashboard : ROUTES.onboarding,
      ),
    [navigate],
  );

  const signup = useCallback(
    async (email: string) => {
      const session = await authApi.signup(email);
      applySession(session);
      routeForNextStep(session);
    },
    [applySession, routeForNextStep],
  );

  const signin = useCallback(
    async (email: string) => {
      const session = await authApi.signin(email);
      applySession(session);
      routeForNextStep(session);
    },
    [applySession, routeForNextStep],
  );

  const signInWithOAuth = useCallback(
    async (provider: OAuthProvider, mode: OAuthMode = "signin") => {
      const { authorizationUrl } = await authApi.oauthStart(provider, mode);
      window.location.href = authorizationUrl; // full-page provider redirect
    },
    [],
  );

  const completeOAuth = useCallback(
    async (provider: OAuthProvider, code: string, state: string) => {
      const session = await authApi.oauthCallback(provider, code, state);
      applySession(session);
      routeForNextStep(session);
    },
    [applySession, routeForNextStep],
  );

  const logout = useCallback(() => {
    // Fire-and-forget: logout must succeed locally even if the network is down.
    void authApi.logout(getRefreshToken()).catch(() => {});
    clearSession();
    navigate(ROUTES.auth);
  }, [clearSession, navigate]);

  const activateWorkspace = useCallback(
    (workspace: WorkspaceSummary, accessToken: string) => {
      // `POST /workspaces` returns a new access token scoped to the workspace;
      // the refresh token is unchanged, so only the access token is swapped.
      setTokens({ accessToken });
      setSnapshot((prev) => (prev ? { ...prev, workspace } : prev));
      setStatus("authenticated");
    },
    [setSnapshot],
  );

  const completeOnboarding = useCallback(() => {
    navigate(ROUTES.dashboard);
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: snapshot?.user ?? null,
      workspace: snapshot?.workspace ?? null,
      workspaceId: snapshot?.workspace?.id ?? null,
      role: snapshot?.role ?? null,
      isAuthenticated: status === "authenticated",
      signup,
      signin,
      signInWithOAuth,
      completeOAuth,
      logout,
      activateWorkspace,
      completeOnboarding,
    }),
    [
      status,
      snapshot,
      signup,
      signin,
      signInWithOAuth,
      completeOAuth,
      logout,
      activateWorkspace,
      completeOnboarding,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

/**
 * The active workspace id, guaranteed present. Use inside workspace-scoped
 * routes (guarded by `RequireWorkspace`), where a missing id is a bug.
 */
export function useWorkspaceId(): string {
  const { workspaceId } = useAuth();
  if (!workspaceId) {
    throw new Error(
      "useWorkspaceId called without an active workspace — is this route guarded by RequireWorkspace?",
    );
  }
  return workspaceId;
}
