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
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
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
