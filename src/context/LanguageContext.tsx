import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "ar" | "he";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// בודק אם השפה הנתונה נכתבת מימין לשמאל
export function isRTLLanguage(lang: Language): boolean {
  return lang === "ar" || lang === "he";
}

// מעדכן את כיוון הכתיבה ואת שפת המסמך ברמת ה-HTML כדי שכל הדף (כולל CSS) יתאים לשפה
function applyDirection(lang: Language) {
  const isRTL = isRTLLanguage(lang);
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

const VALID_LANGUAGES: Language[] = ["en", "ar", "he"];

// קורא את השפה השמורה מ-localStorage, ומחזיר אנגלית כברירת מחדל אם אין ערך תקין
function readStoredLanguage(): Language {
  const stored = localStorage.getItem("jobmatch_language");
  return (VALID_LANGUAGES as string[]).includes(stored ?? "") ? (stored as Language) : "en";
}

// מופעל מיד בטעינת המודול (לפני הרינדור הראשון) כדי שלא יהיה פלאש של כיוון LTR לפני שה-RTL נטען
const _initialLang = readStoredLanguage();
applyDirection(_initialLang);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(_initialLang);

  // מחליף את שפת הממשק, מעדכן את כיוון הכתיבה (RTL/LTR) ושומר את הבחירה לפעם הבאה
  const setLanguage = (lang: Language) => {
    applyDirection(lang);
    setLanguageState(lang);
    localStorage.setItem("jobmatch_language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// hook לגישה לשפה הנוכחית ולפונקציית ההחלפה; זורק שגיאה אם משתמשים בו מחוץ ל-LanguageProvider
export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}

// hook נוחות שמחזיר ישירות אם השפה הנוכחית היא RTL, בלי לחשב את זה בכל קומפוננטה
export function useIsRTL(): boolean {
  const { language } = useLanguage();
  return isRTLLanguage(language);
}
