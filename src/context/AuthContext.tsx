import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { apiFetch, setAuthTokenGetter, setUnauthorizedHandler } from "../utils/api";

export type Role = "candidate" | "company";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  cvFileName?: string | null;
  premium?: boolean;
  phone?: string | null;
  location?: string | null;
  currentTitle?: string | null;
  yearsOfExperience?: string | null;
  skills?: string | null;
  professionalSummary?: string | null;
  industry?: string | null;
  companySize?: string | null;
  website?: string | null;
  companyDescription?: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = "jobmatch_token";

// Stray form-draft keys written by the candidate/company registration and profile pages.
// None of these are ever read back anywhere (verified - they're write-only leftovers), but
// clearing them here means every logout path (sidebar, 401 auto-logout, delete-account)
// gets the same cleanup for free instead of each call site having to duplicate this list.
const STRAY_LOCAL_STORAGE_KEYS = [
  "phone", "location", "currentTitle", "experience", "skills", "summary",
  "resumeName", "isPremium", "industry", "companySize", "website", "description",
];

// The backend stores/returns role case as-is (e.g. some accounts have "COMPANY"/"CANDIDATE"
// from other write paths), but every frontend role check (ProtectedRoute, LoginPage's
// post-login redirect, CandidateLayout's label) compares against the lowercase "candidate"/
// "company" literals. Normalizing here, once, at the single place AuthUser enters state,
// means every consumer can keep doing a plain lowercase comparison. Exported so call sites
// that read the raw API response directly (e.g. LoginPage's own redirect decision, which
// runs before this context's async state update lands) can normalize the same way.
export function normalizeRole(role: string | null | undefined): Role {
  return (role || "").toLowerCase() as Role;
}

function normalizeUser(user: AuthUser): AuthUser {
  return { ...user, role: normalizeRole(user.role) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tokenRef = useRef<string | null>(token);
  tokenRef.current = token;

  const logout = () => {
    tokenRef.current = null;
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    STRAY_LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  };

  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
    setUnauthorizedHandler(() => logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function rehydrate() {
      if (!tokenRef.current) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await apiFetch("/api/auth/me");
        if (!cancelled) {
          setUser(normalizeUser(me));
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    rehydrate();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    // tokenRef.current is normally kept in sync by the render-time assignment above,
    // but that only happens on the NEXT render after setToken schedules one. Callers
    // that immediately fire an authenticated request right after login() (e.g.
    // CandidateRegisterPage saving profile fields right after auto-login) would
    // otherwise read the stale/null token via getToken(), get a 401, and trigger an
    // immediate logout - undoing the login that just happened. Updating the ref here
    // makes the new token available synchronously, before React re-renders.
    tokenRef.current = newToken;
    setToken(newToken);
    setUser(normalizeUser(newUser));
    sessionStorage.setItem(TOKEN_STORAGE_KEY, newToken);
  };

  const refreshUser = async () => {
    if (!tokenRef.current) {
      return;
    }

    try {
      const me = await apiFetch("/api/auth/me");
      setUser(normalizeUser(me));
    } catch {
      // ignore - keep the previously loaded user on a transient failure
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
