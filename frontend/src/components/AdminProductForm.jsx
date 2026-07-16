import { useState } from "react";
import { useAdminApi } from "../services/adminApi";
import { useLanguage } from "../context/LanguageContext";
import "./adminProductForm.css";

// Default empty form values
const EMPTY = {
  name: "",
  nameSq: "",
  category: "",
  price: "",
  image: "",
  description: "",
  descriptionSq: "",
  details: "",
  detailsSq: "",
};

// Product form component for admin (create/edit)
export function AdminProductForm({ initial, categories, onDone, onCancel }) {
  const api = useAdminApi();
  const { t } = useLanguage(); // translation method
  // Initialize form state from initial (edit) or empty/default (create)
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name || "",
          nameSq: initial.nameSq || "",
          category: initial.category?._id || initial.category || "",
          price: initial.price ?? "",
          image: initial.image || "",
          description: initial.description || "",
          descriptionSq: initial.descriptionSq || "",
          details: initial.details || "",
          detailsSq: initial.detailsSq || "",
        }
      : { ...EMPTY, category: categories[0]?._id || "" } // default to first category
  );
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const { uploadURL, publicUrl } = await api.getImageUploadUrl(file.type);

      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putRes.ok) throw new Error("Image upload to storage failed.");

      set("image", publicUrl);
    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!form.name || !form.category || !form.price) {
      setError(t("form.requiredError"));
      return;
    }

    // Build payload, make sure price is a number
    const payload = { ...form, price: Number(form.price) };

    setBusy(true);
    try {
      if (initial) {
        await api.updateProduct(initial._id, payload);
      } else {
        await api.createProduct(payload);
      }
      onDone(); // Notify parent to refresh/close
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="rg-form" onSubmit={handleSubmit}>
      <div className="rg-form-grid">
        {/* Name - English */}
        <label className="rg-field">
          <span className="rg-field-form-label">{t("form.name")}</span>
          <input className="rg-input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        {/* Name - Albanian */}
        <label className="rg-field">
        <span className="rg-field-form-label rg-field-label-sq">{t("form.name")} (SQ)</span>
        <input
          className="rg-input rg-input-sq"
          placeholder="Emri në shqip (opsionale)"
          value={form.nameSq}
          onChange={(e) => set("nameSq", e.target.value)}
        />
        </label>
        {/* Category dropdown */}
        <label className="rg-field">
          <span className="rg-field-form-label">{t("form.category")}</span>
          <select className="rg-input" required value={form.category} onChange={(e) => set("category", e.target.value)}>
            <option value="" disabled>{t("form.selectCategory")}</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </label>
        {/* Price input */}
        <label className="rg-field">
          <span className="rg-field-form-label">{t("form.price")}</span>
          <input className="rg-input" type="number" step="0.01" min="0" required value={form.price} onChange={(e) => set("price", e.target.value)} />
        </label>

        <label className="rg-field">
          <span className="rg-field-form-label">{t("form.photo")}</span>
          <input
            className="rg-input rg-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading && <span className="rg-upload-status">Uploading…</span>}
        </label>
      </div>

      {form.image && (
        <div className="rg-image-preview">
          <img src={form.image} alt="Preview" />
        </div>
      )}


      <label className="rg-field">
        <span className="rg-field-form-label">{t("form.description")}</span>
        <textarea className="rg-input rg-textarea" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </label>

      <label className="rg-field">
        <span className="rg-field-form-label rg-field-label-sq">{t("form.description")} (SQ)</span>
        <textarea
          className="rg-input rg-textarea rg-input-sq"
          rows={3}
          placeholder="Përshkrimi në shqip (opsionale)"
          value={form.descriptionSq}
          onChange={(e) => set("descriptionSq", e.target.value)}
        />
      </label>

      <label className="rg-field">
        <span className="rg-field-form-label">{t("form.details")}</span>
        <textarea className="rg-input rg-textarea" rows={2} value={form.details} onChange={(e) => set("details", e.target.value)} />
      </label>

      <label className="rg-field">
        <span className="rg-field-form-label rg-field-label-sq">{t("form.details")} (SQ)</span>
        <textarea
          className="rg-input rg-textarea rg-input-sq"
          rows={2}
          placeholder="Detaje në shqip (opsionale)"
          value={form.detailsSq}
          onChange={(e) => set("detailsSq", e.target.value)}
        />
      </label>

      {error && <p className="rg-auth-error">{error}</p>}

      <div className="rg-form-actions">
        <button type="button" className="rg-btn rg-btn-ghost" onClick={onCancel}>{t("form.cancel")}</button>
        <button type="submit" className="rg-btn rg-btn-primary" disabled={busy || uploading}>
          {busy ? t("form.saving") : initial ? t("form.saveChanges") : t("form.createProduct")}
        </button>
      </div>
    </form>
  );
}

export default AdminProductForm;