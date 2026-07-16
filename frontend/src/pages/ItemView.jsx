import SEO from "../components/SEO";import { Link, useParams } from "react-router-dom";
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
      <main className="rg-detail-wrap">
        {item && (
          <SEO
          title={item.name}
          description={item.description}
          image={item.image}
          path={`/menu/${slug}/${itemId}`}
          type="product"
        />
        )}

        <Link to={cat ? `/menu/${cat.slug}` : "/"} className="rg-detail-back">
          ← {t("item.backTo")} {cat?.name || t("item.menu")}
        </Link>

        {loading && <div className="rg-loading">{t("item.loading")}</div>}
        {error && <div className="rg-error">{t("item.error")} {error}</div>}
        {!loading && !item && !error && (
          <div className="rg-loading">{t("item.notFound")}</div>
        )}

        {!loading && item && (
          <div className="rg-item-card">
            <div className="rg-item-card-media">
              {item.image ? (
                <>
                  <img
                    src={item.image}
                    alt={`${item.name} - ${item.description}`}
                    onError={handleImageError}
                  />
                  <div className="rg-item-card-media-fallback" style={{ display: "none" }}>
                    {item.name}
                  </div>
                </>
              ) : (
                <div className="rg-item-card-media-fallback">{item.name}</div>
              )}
            </div>

            <div className="rg-item-card-body">
              {cat && (
                <div className="rg-item-card-eyebrow">
                  {cat.name}
                </div>
              )}

              <div className="rg-item-card-headline">
                <h1 className="rg-item-card-name">{item.name}</h1>
                <div className="rg-item-card-price">€{Number(item.price).toFixed(2)}</div>
              </div>

              <p className="rg-item-card-desc">{item.description}</p>

              {item.details && (
                <>
                  <div className="rg-item-card-divider" />
                  <div className="rg-item-card-meta">
                    <div className="rg-item-card-meta-label">{t("item.details")}</div>
                    <p className="rg-item-card-meta-text">{item.details}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
}

export default ItemView;