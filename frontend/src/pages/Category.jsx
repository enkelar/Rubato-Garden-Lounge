import SEO from "../components/SEO";
import { Link, useParams } from "react-router-dom";
import Footer from "./Footer";
import { useLanguage } from "../context/LanguageContext";
import { useFetch } from "../hooks/useFetch";
import "./Rubato.css";
import "./Category.css";

export function CategoryView() {
  const { language, t } = useLanguage();
  const { slug } = useParams();

  const { data, error, loading } = useFetch(
    `/api/menu/${slug}?lang=${language}`,
    {
      errorMessage: "Failed to fetch category",
    }
  );

  const cat = data?.data || null;
  const items = cat?.items || [];

  const hasImages = items.some(
    (item) => item.image && item.image !== "/product-placeholder.svg"
  );

  return (
    <div className="rg-app">
      {cat && (
        <SEO
          title={cat.name}
          description={cat.description}
          image={cat.cover}
          path={`/menu/${cat.slug}`}
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: cat.name,
            itemListElement: (cat.items || []).map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "MenuItem",
                name: item.name,
                description: item.description,
                image: item.image,
                offers: {
                  "@type": "Offer",
                  price: item.price,
                  priceCurrency: "EUR",
                },
              },
            })),
          }}
        />
      )}

      <div className="rg-sticky">
        <div className="rg-sticky-inner">
          <Link to={cat?.isNightMenu ? "/night-menu" : "/"} className="rg-back" aria-label="Back">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>

          <div
            className="rg-sticky-title"
            key={cat ? cat.slug : "pending"}
          >
            {/* {cat ? cat.icon : ""}  */}
            &ensp;
            {cat ? cat.name : ""}
          </div>

          {cat?.note && (
            <div className="rg-sticky-note">{cat.note}</div>
          )}
        </div>
      </div>

      <main className="rg-container">
        {/* Error */}
        {error && (
          <div className="rg-error">
            {t("category.error")} {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rg-loading">
            {t("category.loading")}
          </div>
        )}

        {/* Empty category */}
        {!loading && !error && cat && items.length === 0 && (
          <div className="rg-empty">
           <div className="rg-empty-icon">✦</div>
             <p>{t("category.empty")}</p>
           </div>
        )}

        {/* Products */}
        {!loading && !error && items.length > 0 && (
          <div className={hasImages ? "rg-list" : "rg-list-noimg"}>
            {hasImages
              ? items.map((item, i) => (
                  <Link
                    key={item.id}
                    to={`/menu/${cat.slug}/${item.id}`}
                    className="rg-item"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    <img
                      src={item.image || "/product-placeholder.svg"}
                      alt={`${item.name} - ${item.description}`}
                      className="rg-item-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/product-placeholder.svg";
                      }}
                    />

                    <div className="rg-item-body">
                      <h3 className="rg-item-name">
                        {item.name}
                      </h3>

                      <p className="rg-item-desc">
                        {item.description}
                      </p>

                      <div className="rg-item-price">
                        {Number(item.price).toFixed(2)}€
                      </div>
                    </div>
                  </Link>
                ))
              : items.map((item, i) => (
                  <Link
                    key={item.id}
                    to={`/menu/${cat.slug}/${item.id}`}
                    className="rg-item-noimg"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    <div className="rg-item-noimg-row">
                      <span className="rg-item-noimg-name">
                        {item.name}
                      </span>

                      <span
                        className="rg-item-noimg-leader"
                        aria-hidden="true"
                      />

                      <span className="rg-item-noimg-price">
                        {Number(item.price).toFixed(2)} €
                      </span>
                    </div>

                    {item.description && (
                      <p className="rg-item-noimg-desc">
                        {item.description}
                      </p>
                    )}
                  </Link>
                ))}
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
}

export default CategoryView;