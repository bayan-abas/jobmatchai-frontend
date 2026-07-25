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
  linkedin?: string | null;
  github?: string | null;
  founded?: string | null;
  companyType?: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser, rememberMe?: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = "jobmatch_token";

// קורא את הטוקן השמור, בין אם נשמר ב-localStorage (זכור אותי) או ב-sessionStorage
function readStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY) ?? sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

// שאריות מגרסה ישנה שהחזיקה את הנתונים האלה ב-localStorage לפני שהם עברו לאובייקט המשתמש מהשרת
const STRAY_LOCAL_STORAGE_KEYS = [
  "phone", "location", "currentTitle", "experience", "skills", "summary",
  "resumeName", "isPremium", "industry", "companySize", "website", "description",
];

// מנרמל את התפקיד לאותיות קטנות כדי שההשוואות ל-"candidate"/"company" יעבדו גם אם השרת מחזיר מקרה אחר
export function normalizeRole(role: string | null | undefined): Role {
  return (role || "").toLowerCase() as Role;
}

// מיישר את אובייקט המשתמש שמתקבל מהשרת לפורמט האחיד שהאפליקציה מצפה לו
function normalizeUser(user: AuthUser): AuthUser {
  return { ...user, role: normalizeRole(user.role) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tokenRef = useRef<string | null>(token);
  tokenRef.current = token;

  // מנתק: מנקה את המשתמש והטוקן מהזיכרון ומכל מקומות האחסון (כולל שאריות ישנות)
  const logout = () => {
    tokenRef.current = null;
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    STRAY_LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

  };

  // מחבר את מודול ה-API לקונטקסט: איך לשלוף את הטוקן הנוכחי, ומה לעשות כשהשרת מחזיר 401
  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
    setUnauthorizedHandler(() => logout());

  }, []);

  useEffect(() => {
    let cancelled = false;

    // בעליית האפליקציה: אם יש טוקן שמור, מנסה לשלוף את המשתמש מהשרת כדי לשחזר את ההתחברות
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

  }, []);

  // שומר את הטוקן והמשתמש אחרי התחברות מוצלחת, ובוחר איפה לאחסן את הטוקן לפי "זכור אותי"
  const login = (newToken: string, newUser: AuthUser, rememberMe = false) => {

    tokenRef.current = newToken;
    setToken(newToken);
    setUser(normalizeUser(newUser));

    if (rememberMe) {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  };

  // מרענן את פרטי המשתמש מהשרת (למשל אחרי עדכון פרופיל) בלי לגעת בטוקן עצמו
  const refreshUser = async () => {
    if (!tokenRef.current) {
      return;
    }

    try {
      const me = await apiFetch("/api/auth/me");
      setUser(normalizeUser(me));
    } catch {

    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook לגישה לקונטקסט האימות; זורק שגיאה אם משתמשים בו מחוץ ל-AuthProvider
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
