import SEO from "../components/SEO";import { Link, useParams } from "react-router-dom";
import Footer from "./Footer";
import { useLanguage } from "../context/LanguageContext";
import { useFetch } from "../hooks/useFetch";
import "./Rubato.css";
import "./Category.css";

export function CategoryView() {
  const { language, t } = useLanguage();
  const { slug } = useParams();
  const { data, error, loading } = useFetch(`/api/menu/${slug}?lang=${language}`, {
    errorMessage: "Failed to fetch category",
  });
  const cat = data?.data || null;

  const handleImageError = (e) => {
    e.target.style.display = "none";
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.style.display = "block";
    }
  };

  return (
    <div className="rg-app">
      {cat && (
        <SEO
          title={cat.name}
          description={cat.description}
          image={cat.cover}
          path={`/menu/${cat.slug}`}
        />
      )}

      <div className="rg-sticky">
        <div className="rg-sticky-inner">
          <Link to="/" className="rg-back" aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="rg-sticky-title" key={cat ? cat.slug : "pending"}>
            {cat ? cat.icon : ""} {cat ? cat.name : ""}
          </div>
          {cat?.note && <div className="rg-sticky-note">{cat.note}</div>}
        </div>
      </div>

      <main className="rg-container">
        {error && (
          <div className="rg-error">{t("category.error")} {error}</div>
        )}
        {loading && <div className="rg-loading">{t("category.loading")}</div>}
        {!loading && !cat?.items && !error && <div>{t("category.empty")}</div>}
        <div className="rg-list">
          {cat?.items?.map((item, i) => (
            <Link
              key={item.id}
              to={`/menu/${cat.slug}/${item.id}`}
              className="rg-item"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              {item.image ? (
                <>
                  <img
                    src={item.image}
                    alt={`${item.name} - ${item.description}`}
                    className="rg-item-img"
                    loading="lazy"
                    onError={handleImageError}
                  />
                  <div
                    className="rg-item-img-placeholder"
                    style={{ display: "none" }}
                  >
                    {item.name}
                  </div>
                </>
              ) : (
                <div className="rg-item-img-placeholder">{item.name}</div>
              )}
              <div className="rg-item-body">
                <h3 className="rg-item-name">{item.name}</h3>
                <p className="rg-item-desc">{item.description}</p>
                <div className="rg-item-price">{item.price} €</div>
              </div>
            </Link>
          ))}
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default CategoryView;