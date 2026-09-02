import { createContext, useContext, useState, useCallback } from "react";
import { TRANSLATIONS } from "../translations";

const LANG_KEY = "ibrvar_lang";
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === "en" || saved === "ja" ? saved : "en";
  });

  const setLang = useCallback((next) => {
    localStorage.setItem(LANG_KEY, next);
    setLangState(next);
  }, []);
  const toggleLang = useCallback(() => setLang(lang === "en" ? "ja" : "en"), [lang, setLang]);

  // t("area.key") looks up TRANSLATIONS.area.key[lang]. Falls back to the
  // key itself (visibly wrong, easy to spot) if it hasn't been added to
  // translations.js yet — never crashes on a missing key.
  const t = useCallback((path) => {
    const [area, key] = path.split(".");
    const entry = TRANSLATIONS[area]?.[key];
    if (!entry) return path;
    return entry[lang] ?? entry.en ?? path;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used inside <LanguageProvider>");
  return ctx;
}