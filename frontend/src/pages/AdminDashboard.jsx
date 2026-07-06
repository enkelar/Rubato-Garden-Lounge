import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdminApi } from "../services/adminApi";
import AdminProductForm from "../components/AdminProductForm";
import "./Rubato.css";
import "./adminDashboard.css";

export function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const api = useAdminApi();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.getCategories(),
          api.getProducts(),
        ]);
        setCategories(catRes.categories || []);
        setProducts(prodRes.products || []);
      } catch (err) {
        setError(err.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [api]);

  const categoryName = (catId) => {
    const id = catId?._id || catId;
    return categories.find((c) => c._id === id)?.name || "—";
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const catId = p.category?._id || p.category;
      if (filterCat !== "all" && catId !== filterCat) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [products, search, filterCat]);

  async function handleDelete(p) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteProduct(p._id);
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  }

  function handleSignOut() {
    logout();
    navigate("/auth");
  }

  return (
    <div className="rg-app">
      <header className="rg-admin-nav">
        <div className="rg-admin-nav-inner">
          <div className="rg-admin-brand">Rubato</div>
          <nav className="rg-admin-nav-links">
            <Link to="/">Home</Link>
            <Link to="/admin" className="active">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="rg-admin-main">
        <div className="rg-admin-head">
          <div>
            <div className="rg-eyebrow">Admin</div>
            <h1 className="rg-admin-title">Menu management</h1>
          </div>
          <div className="rg-admin-actions">
            <Link to="/" className="rg-btn rg-btn-ghost">
              View menu
            </Link>
            <button className="rg-btn rg-btn-ghost" onClick={handleSignOut}>
              Sign out
            </button>
            <button
              className="rg-btn rg-btn-primary"
              onClick={() => setEditing("new")}
            >
              + New product
            </button>
          </div>
        </div>

        <div className="rg-admin-filters">
          <input
            className="rg-input"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rg-input"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="rg-error">{error}</div>}
        {loading && <div className="rg-loading">Loading products…</div>}

        {!loading && (
          <div className="rg-admin-table-wrap">
            <table className="rg-admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="rg-right">Price</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="rg-admin-product-cell">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt=""
                            className="rg-admin-thumb"
                          />
                        ) : (
                          <div className="rg-admin-thumb rg-admin-thumb-empty" />
                        )}
                        <div className="rg-admin-product-name">{p.name}</div>
                      </div>
                    </td>
                    <td className="rg-admin-cat-cell">
                      {categoryName(p.category)}
                    </td>
                    <td className="rg-right rg-admin-price">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="rg-right">
                      <div className="rg-admin-row-actions">
                        <button
                          className="rg-chip-btn"
                          onClick={() => setEditing(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="rg-chip-btn rg-chip-btn-danger"
                          onClick={() => handleDelete(p)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="rg-admin-empty">
                      No products match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {editing && (
        <div
          className="rg-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div className="rg-modal">
            <div className="rg-modal-head">
              <h2>
                {editing === "new" ? "New product" : `Edit · ${editing.name}`}
              </h2>
              <button
                className="rg-modal-close"
                onClick={() => setEditing(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <AdminProductForm
              initial={editing === "new" ? null : editing}
              categories={categories}
              onDone={async () => {
                setEditing(null);
                const [catRes, prodRes] = await Promise.all([
                  api.getCategories(),
                  api.getProducts(),
                ]);
                setCategories(catRes.categories || []);
                setProducts(prodRes.products || []);
              }}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
