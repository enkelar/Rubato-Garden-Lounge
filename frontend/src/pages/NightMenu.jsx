import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { useLanguage } from "../context/LanguageContext";
import { useFetch } from "../hooks/useFetch";
import SEO from "../components/SEO";
import "./Rubato.css";
import "./Home.css";
import "./NightMenu.css";

export function NightMenuView() {
  const { language, t } = useLanguage();
  const { data, error, loading } = useFetch(`/api/menu?lang=${language}&section=night`, {
    errorMessage: "Failed to fetch night menu",
  });
  const categories = data?.categories || [];

  const [isNightOpen, setIsNightOpen] = useState(() => new Date().getHours() >= 19);
  useEffect(() => {
    const check = () => setIsNightOpen(new Date().getHours() >= 19);
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rg-app rg-night-app">
      <SEO title={t("nightMenu.title")} path="/night-menu" />

      <header className="rg-hero">
        <div className="rg-eyebrow">{t("nightMenu.eyebrow")}</div>
        <h1 className="rg-title">{t("nightMenu.title")}</h1>
        <div className="rg-subtitle">
          {t("nightMenu.subtitle")}
          {isNightOpen && (
            <span className="rg-night-badge rg-night-badge-inline">
            - {t("nightMenu.openNow")}
            </span>
          )}
        </div>
        <div className="rg-divider">✦</div>
        <Link to="/" className="rg-detail-back rg-night-back">
           {t("nightMenu.back")}
        </Link>
      </header>

      <main className="rg-container">
        {error && <div className="rg-error">{t("nightMenu.error")} {error}</div>}
        {loading && <div className="rg-loading">{t("nightMenu.loading")}</div>}
        {!loading && categories.length === 0 && !error && (
          <div>{t("nightMenu.empty")}</div>
        )}
        <div className="rg-grid">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              to={`/menu/${cat.slug}`}
              className="rg-card"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <img
                src={cat.cover || "/category-placeholder.svg"}
                alt={`${cat.name} category`}
                className="rg-card-img"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/category-placeholder.svg";
                }}
              />
              <div className="rg-card-overlay" />
              <div className="rg-card-shine" />
              <div className="rg-card-content">
                <div className="rg-card-name">{cat.name}</div>
                {cat.note && <div className="rg-card-note">{cat.note}</div>}
              </div>
            </Link>
          ))}
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default NightMenuView;