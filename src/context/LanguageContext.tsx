import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "ar" | "he";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Single source of truth for "is this language RTL" - previously every component repeated
// `language === "ar" || language === "he"` inline. Exported so new/redesigned components can
// share one definition instead of re-deriving it (see useIsRTL below).
export function isRTLLanguage(lang: Language): boolean {
  return lang === "ar" || lang === "he";
}

// Apply direction to <html> immediately so it's ready before first render
function applyDirection(lang: Language) {
  const isRTL = isRTLLanguage(lang);
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

// Shared replacement for the `const isRTL = language === "ar" || language === "he"` line
// duplicated across most page/component files.
export function useIsRTL(): boolean {
  const { language } = useLanguage();
  return isRTLLanguage(language);
}