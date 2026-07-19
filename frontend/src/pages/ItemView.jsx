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
            jsonLd={{
              "@context": "https://schema.org",
              "@type": "MenuItem",
              name: item.name,
              description: item.description,
              image: item.image,
              offers: {
                "@type": "Offer",
                price: item.price,
                priceCurrency: "EUR",
              },
            }}
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
              <img
                 src={item.image || "/product-placeholder.svg"}
                 alt={`${item.name} - ${item.description}`}
                 onError={(e) => {
                   e.target.onerror = null;
                   e.target.src = "/product-placeholder.svg";
                 }}
               />
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