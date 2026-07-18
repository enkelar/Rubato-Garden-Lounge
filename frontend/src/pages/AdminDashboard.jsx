import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useAdminApi } from "../services/adminApi";
import AdminProductForm from "../components/AdminProductForm";
import AdminCategoryForm from "../components/AdminCategoryForm";
import LanguageToggle from "../components/LanguageToggle";
import ConfirmModal from "../components/ConfirmModal";
import "./Rubato.css";
import "./adminDashboard.css";

export function AdminDashboard() {
  const { logout } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const api = useAdminApi();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [editing, setEditing] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [view, setView] = useState("products");

  // Unified delete-confirmation state — works for both products and categories.
  // deleteTarget.kind tells us which API call / which list to update.
  const [deleteTarget, setDeleteTarget] = useState(null); // { kind: "product" | "category", item }
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const localizedName = (obj) =>
    language === "sq" && obj?.nameSq ? obj.nameSq : obj?.name;

  const categoryName = (catId) => {
    const id = catId?._id || catId;
    const cat = categories.find((c) => c._id === id);
    return cat ? localizedName(cat) : "—";
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

  const filteredCategories = useMemo(() => {
  return categories.filter((c) => {
    const name = language === "sq" && c?.nameSq ? c.nameSq : c?.name;
    if (categorySearch && !name?.toLowerCase().includes(categorySearch.toLowerCase()))
      return false;
    return true;
  });
}, [categories, categorySearch, language]);

  function handleDelete(p) {
    setDeleteError(null);
    setDeleteTarget({ kind: "product", item: p });
  }

  function handleDeleteCategory(c) {
    setDeleteError(null);
    setDeleteTarget({ kind: "category", item: c });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { kind, item } = deleteTarget;

    setDeleting(true);
    setDeleteError(null);
    try {
      if (kind === "product") {
        await api.deleteProduct(item._id);
        setProducts((prev) => prev.filter((x) => x._id !== item._id));
      } else {
        await api.deleteCategory(item._id);
        setCategories((prev) => prev.filter((x) => x._id !== item._id));
      }
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message || "Delete failed");
    } finally {
      setDeleting(false);
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
          <div className="rg-admin-brand">{t("admin.brand")}</div>
          <nav className="rg-admin-nav-links">
            <Link to="/">{t("admin.home")}</Link>
            <Link to="/admin" className="active">
              {t("admin.admin")}
            </Link>
            <LanguageToggle />
          </nav>
        </div>
      </header>

      <main className="rg-admin-main">
        <div className="rg-admin-head">
          <div>
            <div className="rg-eyebrow">{t("admin.eyebrow")}</div>
            <h1 className="rg-admin-title">{t("admin.title")}</h1>
          </div>
          <div className="rg-admin-actions">
            <Link to="/" className="rg-btn rg-btn-ghost">
              {t("admin.viewMenu")}
            </Link>
            <button className="rg-btn rg-btn-ghost" onClick={handleSignOut}>
              {t("admin.signOut")}
            </button>
            {view === "products" ? (
              <button className="rg-btn rg-btn-primary" onClick={() => setEditing("new")}>
                {t("admin.newProduct")}
              </button>
            ) : (
              <button className="rg-btn rg-btn-primary" onClick={() => setEditingCategory("new")}>
                {t("admin.newCategory")}
              </button>
            )}
          </div>
        </div>

        <div className="rg-admin-tabs">
          <button
            className={`rg-chip-btn ${view === "products" ? "rg-chip-btn-active" : ""}`}
            onClick={() => setView("products")}
          >
            {t("admin.products")}
          </button>
          <button
            className={`rg-chip-btn ${view === "categories" ? "rg-chip-btn-active" : ""}`}
            onClick={() => setView("categories")}
          >
            {t("admin.categories")}
          </button>
        </div>

        {view === "products" && (
          <>
            <div className="rg-admin-filters">
              <input
                className="rg-input"
                placeholder={t("admin.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="rg-input"
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
              >
                <option value="all">{t("admin.allCategories")}</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {localizedName(c)}
                  </option>
                ))}
              </select>
            </div>

            {error && <div className="rg-error">{error}</div>}
            {loading && <div className="rg-loading">{t("admin.loadingProducts")}</div>}

            {!loading && (
              <div className="rg-admin-table-wrap">
                <table className="rg-admin-table rg-admin-table-products">
                  <thead>
                    <tr>
                      <th>{t("admin.thProduct")}</th>
                      <th>{t("admin.thCategory")}</th>
                      <th className="rg-right">{t("admin.thPrice")}</th>
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
                                loading="lazy"
                              />
                            ) : (
                              <div className="rg-admin-thumb rg-admin-thumb-empty" />
                            )}
                            <div className="rg-admin-product-name">{localizedName(p)}</div>
                          </div>
                        </td>
                        <td className="rg-admin-cat-cell">
                          {categoryName(p.category)}
                        </td>
                        <td className="rg-right rg-admin-price">
                          €{Number(p.price).toFixed(2)}
                        </td>
                        <td className="rg-right">
                          <div className="rg-admin-row-actions">
                            <button
                              className="rg-chip-btn"
                              onClick={() => setEditing(p)}
                            >
                              {t("admin.edit")}
                            </button>
                            <button
                              className="rg-chip-btn rg-chip-btn-danger"
                              onClick={() => handleDelete(p)}
                            >
                              {t("admin.delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="rg-admin-empty">
                          {t("admin.noMatch")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {view === "categories" && (
          <>
            <div className="rg-admin-filters">
              <input
                className="rg-input"
                placeholder={t("admin.searchCategoriesPlaceholder")}
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
            </div>

            <div className="rg-admin-table-wrap">
              <table className="rg-admin-table rg-admin-table-categories">
                <thead>
                  <tr>
                    <th>{t("admin.thCategoryName")}</th>
                    <th>{t("admin.thSlug")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div className="rg-admin-product-cell">
                          {c.cover ? (
                            <img 
                            src={c.cover} 
                            alt="" 
                            className="rg-admin-thumb" 
                            loading="lazy"
                            />
                          ) : (
                            <div className="rg-admin-thumb rg-admin-thumb-empty" />
                          )}
                          <div className="rg-admin-product-name">
                            {c.icon} {localizedName(c)}
                          </div>
                        </div>
                      </td>
                      <td className="rg-admin-cat-cell">{c.slug}</td>
                      <td className="rg-right">
                        <div className="rg-admin-row-actions">
                          <button className="rg-chip-btn" onClick={() => setEditingCategory(c)}>
                            {t("admin.edit")}
                          </button>
                          <button
                            className="rg-chip-btn rg-chip-btn-danger"
                            onClick={() => handleDeleteCategory(c)}
                          >
                            {t("admin.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCategories.length === 0 && (
                    <tr>
                      <td colSpan={3} className="rg-admin-empty">
                        {categorySearch ? t("admin.noCategoryMatch") : t("admin.noCategories")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
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
                {editing === "new"
                  ? t("admin.newProductTitle")
                  : `${t("admin.editProductTitle")} ${editing.name}`}
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
              onDone={(savedProduct)=> {
                setEditing(null);
                setProducts((prev) => {
                  const exists = prev.some((p) => p._id === savedProduct._id);
                  return exists
                  ? prev.map((p)=>(p._id === savedProduct._id ? savedProduct : p))
                  : [...prev, savedProduct];
                });
              }}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {editingCategory && (
        <div
          className="rg-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingCategory(null);
          }}
        >
          <div className="rg-modal">
            <div className="rg-modal-head">
              <h2>
                {editingCategory === "new"
                  ? t("admin.newCategoryTitle")
                  : `${t("admin.editCategoryTitle")} ${editingCategory.name}`}
              </h2>
              <button
                className="rg-modal-close"
                onClick={() => setEditingCategory(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <AdminCategoryForm
              initial={editingCategory === "new" ? null : editingCategory}
              onDone={(savedCategory) => {
                setEditingCategory(null);
                setCategories((prev) => {
                  const exists = prev.some((c) => c._id === savedCategory._id);
                  return exists
                  ? prev.map((c) => (c._id === savedCategory._id ? savedCategory : c))
                  :[...prev, savedCategory];
                });
              }}
              onCancel={() => setEditingCategory(null)}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={`${t("admin.delete")}?`}
        message={
          deleteTarget
            ? deleteTarget.kind === "product"
              ? `Delete "${localizedName(deleteTarget.item)}"? This cannot be undone.`
              : `Delete "${localizedName(deleteTarget.item)}"? This will fail if any products still belong to this category.`
            : ""
        }
        confirmLabel={t("admin.delete")}
        cancelLabel={t("form.cancel")}
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default AdminDashboard;