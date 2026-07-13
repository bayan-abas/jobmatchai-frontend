import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "ar" | "he";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Apply direction to <html> immediately so it's ready before first render
function applyDirection(lang: Language) {
  const isRTL = lang === "ar" || lang === "he";
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

const VALID_LANGUAGES: Language[] = ["en", "ar", "he"];

// Set direction from saved preference before any component renders. Validated against the real
// union (not just cast) - a corrupted/stale/tampered localStorage value would otherwise become
// the app's `language`, and every page that does `translations[language]` with no `|| translations.en`
// fallback would crash with "Cannot read properties of undefined" on first render.
function readStoredLanguage(): Language {
  const stored = localStorage.getItem("jobmatch_language");
  return (VALID_LANGUAGES as string[]).includes(stored ?? "") ? (stored as Language) : "en";
}

const _initialLang = readStoredLanguage();
applyDirection(_initialLang);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(_initialLang);

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

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}