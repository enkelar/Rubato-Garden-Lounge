import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "./Footer";
import "./Rubato.css";
import "./Category.css";

export function CategoryView() {
  const [cat, setCat] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();

  useEffect(() => {
    fetch(`/api/menu/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch category");
        return res.json();
      })
      .then((data) => setCat(data.data))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Handle image error by hiding the image and showing a placeholder
  const handleImageError = (e) => {
    e.target.style.display = "none";
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.style.display = "block";
    }
  };

  return (
    <div className="rg-app">
      <div className="rg-sticky">
        <div className="rg-sticky-inner">
          <Link to="/" className="rg-back" aria-label="Back">
            ←
          </Link> 
          <div className="rg-sticky-title">
            {cat ? cat.icon : ""} {cat ? cat.name : ""}
          </div>
          {cat?.note && <div className="rg-sticky-note">{cat.note}</div>}
        </div>
      </div>

      <main className="rg-container">
        {error && (
          <div className="rg-error">Failed to load products: {error}</div>
        )}
        {loading && <div className="rg-loading">Loading products...</div>}
        {!loading && !cat?.items && !error && <div>No products found.</div>}
        <div className="rg-list">
          {cat?.items?.map((item) => (
            <Link
              key={item.id}
              to={`/menu/${cat.slug}/${item.id}`}
              className="rg-item"
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
                <div className="rg-item-price">{item.price}</div>
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
