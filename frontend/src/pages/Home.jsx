import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { useLanguage } from "../context/LanguageContext";
import { useFetch } from "../hooks/useFetch";
import SEO from "../components/SEO";
import { SITE_URL } from "../config/site";
import "./Rubato.css";
import "./Home.css";

export function HomeView() {
  const { language, t } = useLanguage();
  const { data, error, loading } = useFetch(`/api/menu?lang=${language}`, {
    errorMessage: "Failed to fetch categories",
  });
  const categories = data?.categories || [];

  const [isNightOpen, setIsNightOpen] = useState(() => new Date().getHours() >= 19);
  useEffect(() => {
    const check = () => setIsNightOpen(new Date().getHours() >= 19);
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rg-app">
      <header className="rg-hero">
        <SEO
          path="/"
          jsonLd={{
           "@context": "https://schema.org",
           "@type": "Restaurant",
           name: "Rubato Garden Lounge",
           servesCuisine: "International",
           url: SITE_URL,
           image: `${SITE_URL}/og-cover.jpg`,
           address: {
             "@type": "PostalAddress",
             streetAddress: "18 Hyzri Talla",
             addressLocality: "Prishtinë",
             addressCountry: "XK",
           },
           telephone: "+38343508502",
         }}
        />
        <div className="rg-eyebrow">{t("home.eyebrow")}</div>
        <h1 className="rg-title">Rubato</h1>
        <div className="rg-subtitle">{t("home.subtitle")}</div>
        <div className="rg-divider">✦</div>
        <Link
          to="/night-menu"
          className={isNightOpen ? "rg-night-link rg-night-link-active" : "rg-night-link"}
        >
          {t("nightMenu.viewButton")}
          <svg className="rg-night-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </header>

      <main className="rg-container">
        {error && <div className="rg-error">{t("home.error")} {error}</div>}
        {loading && (
          <div className="rg-grid" role="status" aria-label={t("home.loading")}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rg-card rg-card-skeleton" />
            ))}
          </div>
        )}
        {!loading && categories.length === 0 && !error && (
          <div>{t("home.empty")}</div>
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
                loading={i < 6 ? "eager" : "lazy"}
                fetchPriority={i < 4 ? "high" : undefined}
                decoding="async"  
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

export default HomeView;