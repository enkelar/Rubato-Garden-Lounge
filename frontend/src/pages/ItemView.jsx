import { Link, useParams } from "react-router-dom";
import Footer from "./Footer";
import "./Item.css";
import "./Rubato.css";
import { useState, useEffect } from "react";

function useItemPage(slug, itemId) {
  const [cat, setCat] = useState(null);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/menu/${slug}/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch item");
        return res.json();
      })
      .then((data) => {
        setCat(data.data.category);
        setItem(data.data.item);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug, itemId]);

  const shareUrl = `/menu/${cat?.slug}/${item?.id}`;
  return { cat, item, shareUrl, error, loading };
}

export function ItemView() {
  const { slug, itemId } = useParams();
  const { cat, item, shareUrl, error, loading } = useItemPage(slug, itemId);

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
        {loading && <div className="rg-loading">Loading product...</div>}
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
          <div className="rg-loading">Product not found.</div>
        )}
      </div>

      <main className="rg-container">
        {error && (
          <div className="rg-error">Failed to load product: {error}</div>
        )}

        <div className="rg-detail-body">
          <h1 className="rg-detail-name">{item?.name || ""}</h1>
          <div className="rg-detail-price">{item?.price || ""}</div>

          <div className="rg-section">
            <div className="rg-section-label">What it contains</div>
            <p>{item?.description || ""}</p>
          </div>

          {item?.details && (
            <div className="rg-section">
              <div className="rg-section-label">Details</div>
              <p>{item.details}</p>
            </div>
          )}

          <div className="rg-actions">
            <Link
              to={cat ? `/menu/${cat.slug}` : "/"}
              className="rg-btn rg-btn-ghost"
            >
              Back to {cat?.name || "Menu"}
            </Link>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="rg-btn rg-btn-primary"
            >
              Share
            </a>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default ItemView;
