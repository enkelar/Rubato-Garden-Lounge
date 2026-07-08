import { Link } from "react-router-dom";
import Footer from "./Footer";
import { useLanguage } from "../context/LanguageContext";
import { useFetch } from "../hooks/useFetch";
import "./Rubato.css";
import "./Home.css";

export function HomeView() {
  const { language, t } = useLanguage();
  const { data, error, loading } = useFetch(`/api/menu?lang=${language}`, {
    errorMessage: "Failed to fetch categories",
  });
  const categories = data?.categories || [];


  const handleImageError = (e) => {
    e.target.style.display = "none";
    const fallback = e.target.nextElementSibling;
    if (fallback) fallback.style.display = "flex";
  };

  return (
    <div className="rg-app">
      <header className="rg-hero">
        <div className="rg-eyebrow">{t("home.eyebrow")}</div>
        <h1 className="rg-title">Rubato</h1>
        <div className="rg-subtitle">{t("home.subtitle")}</div>
        <div className="rg-divider">✦</div>
      </header>

      <main className="rg-container">
        {error && <div className="rg-error">{t("home.error")} {error}</div>}
        {loading && <div className="rg-loading">{t("home.loading")}</div>}
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
              {cat.cover && (
                <img
                  src={cat.cover}
                  alt={`${cat.name} category`}
                  className="rg-card-img"
                  onError={handleImageError}
                />
              )}
              <div
                className="rg-card-img-placeholder"
                style={{ display: cat.cover ? "none" : "flex" }}
              >
                <span className="rg-card-placeholder-name">{cat.name}</span>
              </div>
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