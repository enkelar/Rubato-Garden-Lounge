import { useLanguage } from "../context/LanguageContext";
import "./LanguageToggle.css";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      className="rg-lang-toggle"
      onClick={toggleLanguage}
      aria-label="Switch language"
    >
      <span className={language === "en" ? "rg-lang-active" : ""}>EN</span>
      <span className="rg-lang-sep">/</span>
      <span className={language === "sq" ? "rg-lang-active" : ""}>SQ</span>
    </button>
  );
}

export default LanguageToggle;