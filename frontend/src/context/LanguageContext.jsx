/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import en from "../locales/en";
import sq from "../locales/sq";

const dictionaries = { en, sq };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem("rg_lang") || "en"
  );

  const setLanguage = useCallback((lang) => {
    localStorage.setItem("rg_lang", lang);
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "sq" : "en");
  }, [language, setLanguage]);

  const t = useCallback(
    (key) => {
      const dict = dictionaries[language] || dictionaries.en;
      return dict[key] ?? dictionaries.en[key] ?? key;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}