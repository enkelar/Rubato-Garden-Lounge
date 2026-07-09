import { useState } from "react";
import { useAdminApi } from "../services/adminApi";
import { useLanguage } from "../context/LanguageContext";
import "./adminProductForm.css";

const EMPTY = {
  name: "",
  nameSq: "",
  description: "",
  descriptionSq: "",
  icon: "",
  cover: "",
  note: "",
  noteSq: "",
};

export function AdminCategoryForm({ initial, onDone, onCancel }) {
  const api = useAdminApi();
  const { t } = useLanguage();
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name || "",
          nameSq: initial.nameSq || "",
          description: initial.description || "",
          descriptionSq: initial.descriptionSq || "",
          icon: initial.icon || "",
          cover: initial.cover || "",
          note: initial.note || "",
          noteSq: initial.noteSq || "",
        }
      : { ...EMPTY }
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

      set("cover", publicUrl);
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

    if (!form.name || !form.description) {
      setError(t("categoryForm.requiredError"));
      return;
    }

    setBusy(true);
    try {
      if (initial) {
        await api.updateCategory(initial._id, form);
      } else {
        await api.createCategory(form);
      }
      onDone();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="rg-form" onSubmit={handleSubmit}>
      <div className="rg-form-grid">
        <label className="rg-field">
          <span className="rg-field-form-label">{t("form.name")}</span>
          <input className="rg-input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </label>

        <label className="rg-field">
          <span className="rg-field-form-label rg-field-label-sq">{t("form.name")} (SQ)</span>
          <input
            className="rg-input rg-input-sq"
            placeholder="Emri në shqip (opsionale)"
            value={form.nameSq}
            onChange={(e) => set("nameSq", e.target.value)}
          />
        </label>

        <label className="rg-field">
          <span className="rg-field-form-label">{t("categoryForm.icon")}</span>
          <input
            className="rg-input"
            placeholder="🍽️"
            value={form.icon}
            onChange={(e) => set("icon", e.target.value)}
          />
        </label>

        <label className="rg-field">
          <span className="rg-field-form-label">{t("categoryForm.cover")}</span>
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

      {form.cover && (
        <div className="rg-image-preview">
          <img src={form.cover} alt="Preview" />
        </div>
      )}

      <label className="rg-field">
        <span className="rg-field-form-label">{t("form.description")}</span>
        <textarea className="rg-input rg-textarea" rows={2} required value={form.description} onChange={(e) => set("description", e.target.value)} />
      </label>

      <label className="rg-field">
        <span className="rg-field-form-label rg-field-label-sq">{t("form.description")} (SQ)</span>
        <textarea
          className="rg-input rg-textarea rg-input-sq"
          rows={2}
          placeholder="Përshkrimi në shqip (opsionale)"
          value={form.descriptionSq}
          onChange={(e) => set("descriptionSq", e.target.value)}
        />
      </label>

      <label className="rg-field">
        <span className="rg-field-form-label">{t("categoryForm.note")}</span>
        <input className="rg-input" value={form.note} onChange={(e) => set("note", e.target.value)} />
      </label>

      <label className="rg-field">
        <span className="rg-field-form-label rg-field-label-sq">{t("categoryForm.note")} (SQ)</span>
        <input
          className="rg-input rg-input-sq"
          value={form.noteSq}
          onChange={(e) => set("noteSq", e.target.value)}
        />
      </label>

      {error && <p className="rg-auth-error">{error}</p>}

      <div className="rg-form-actions">
        <button type="button" className="rg-btn rg-btn-ghost" onClick={onCancel}>{t("form.cancel")}</button>
        <button type="submit" className="rg-btn rg-btn-primary" disabled={busy || uploading}>
          {busy ? t("form.saving") : initial ? t("form.saveChanges") : t("categoryForm.createCategory")}
        </button>
      </div>
    </form>
  );
}

export default AdminCategoryForm;