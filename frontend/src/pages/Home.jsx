import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "./Footer";
import "./Rubato.css";
import "./Home.css";

export function HomeView() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/menu`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((data) => setCategories(data.categories))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleImageError = (e) => {
    e.target.style.display = "none";
    const fallback = e.target.nextElementSibling;
    if (fallback) fallback.style.display = "flex";
  };

  return (
    <div className="rg-app">
      <header className="rg-hero">
        <div className="rg-eyebrow">Welcome to</div>
        <h1 className="rg-title">Rubato</h1>
        <div className="rg-subtitle">Garden Lounge · Digital Menu</div>
        <div className="rg-divider">✦</div>
      </header>

      <main className="rg-container">
        {error && <div className="rg-error">Failed to load menu: {error}</div>}
        {loading && <div className="rg-loading">Loading menu...</div>}
        {!loading && categories.length === 0 && !error && (
          <div>No categories found.</div>
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
                {/* <div className="rg-card-icon">{cat.icon}</div> */}
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