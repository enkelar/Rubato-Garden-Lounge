import { Link, useParams } from "react-router-dom";
import Footer from "./Footer";
import { useLanguage } from "../context/LanguageContext";
import { useFetch } from "../hooks/useFetch";
import "./Rubato.css";
import "./Item.css";

function useItemPage(slug, itemId, language) {
  const { data, error, loading } = useFetch(
    `/api/menu/${slug}/${itemId}?lang=${language}`,
    { errorMessage: "Failed to fetch item" }
  );

  const cat = data?.data?.category || null;
  const item = data?.data?.item || null;

  return { cat, item, error, loading };
}

export function ItemView() {
  const { slug, itemId } = useParams();
  const { language, t } = useLanguage();
  const { cat, item, error, loading } = useItemPage(slug, itemId, language);

  const handleImageError = (e) => {
    e.target.style.display = "none";
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.style.display = "flex";
    }
  };

  return (
    <div className="rg-app rg-detail">
      <Link
          to={cat ? `/menu/${cat.slug}` : "/"}
          className="rg-close"
          aria-label="Close"
        >
          ×
        </Link>
      <div className="rg-detail-hero">
        {loading && <div className="rg-loading">{t("item.loading")}</div>}
        {!loading && item && item.image && (
          <img
            src={item.image}
            alt={`${item.name} - ${item.description}`}
            onError={handleImageError}
          />
        )}
        {!loading && item && !item.image && (
          <div className="rg-detail-img-placeholder">{item.name}</div>
        )}
        {!loading && item && item.image && (
          <div
            className="rg-detail-img-placeholder"
            style={{ display: "none" }}
          >
            {item.name}
          </div>
        )}
        {!loading && !item && !error && (
          <div className="rg-loading">{t("item.notFound")}</div>
        )}
      </div>

      <main className="rg-container">
        {error && (
          <div className="rg-error">{t("item.error")} {error}</div>
        )}

        <div className="rg-detail-body">
          <h1 className="rg-detail-name">{item?.name || ""}</h1>
          <div className="rg-detail-price">{item?.price || ""}</div>

          <div className="rg-section">
            <div className="rg-section-label">{t("item.contains")}</div>
            <p>{item?.description || ""}</p>
          </div>

          {item?.details && (
            <div className="rg-section">
              <div className="rg-section-label">{t("item.details")}</div>
              <p>{item.details}</p>
            </div>
          )}

          <div className="rg-actions">
            <Link
              to={cat ? `/menu/${cat.slug}` : "/"}
              className="rg-btn rg-btn-ghost"
            >
              {t("item.backTo")} {cat?.name || t("item.menu")}
            </Link>
           
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default ItemView;