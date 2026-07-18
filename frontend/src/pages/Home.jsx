import { Link } from "react-router-dom";
import Footer from "./Footer";
import { useLanguage } from "../context/LanguageContext";
import { useFetch } from "../hooks/useFetch";
import SEO from "../components/SEO";
import "./Rubato.css";
import "./Home.css";

export function HomeView() {
  const { language, t } = useLanguage();
  const { data, error, loading } = useFetch(`/api/menu?lang=${language}`, {
    errorMessage: "Failed to fetch categories",
  });
  const categories = data?.categories || [];

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
          url: "https://yourdomain.com",
          image: "https://yourdomain.com/og-cover.jpg",
        }}
      />
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

export default HomeView;