import { useState } from "react";
import { useAdminApi } from "../services/adminApi";
import { useLanguage } from "../context/LanguageContext";
import "./adminProductForm.css";

// Default empty form values
const EMPTY = {
  name: "",
  nameSq: "",
  icon: "",
  cover: "",
  note: "",
  noteSq: "",
};

export function AdminCategoryForm({ initial, onDone, onCancel }) {
  const api = useAdminApi();
  const { t } = useLanguage(); // translation function
  // Initialize form state from initial (edit) or empty (create)
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name || "",
          nameSq: initial.nameSq || "",
          icon: initial.icon || "",
          cover: initial.cover || "",
          note: initial.note || "",
          noteSq: initial.noteSq || "",
        }
      : { ...EMPTY },
  );
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false); // save-in-progress state
  const [uploading, setUploading] = useState(false); // image upload state

  // helper to update a single field in form
  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // handle image file upload to R2 via presigned URL
  async function handleFileChange(e) {
    const file = e.target.files?.[0]; // get selected file
    if (!file) return;

    setError(null);
    setUploading(true); // show uploading state
    try {
      // get presigned URL from API
      const { uploadURL, publicUrl } = await api.getImageUploadUrl(file.type, file.size);

      // upload file directly to storage
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putRes.ok) throw new Error("Image upload to storage failed.");

      set("cover", publicUrl); // set public url in form
    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = ""; // reset file input
    }
  }

  // handle form submit ( create or update category )
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.name) {
      setError(t("categoryForm.requiredError"));
      return;
    }

    setBusy(true); // show saving state
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
        {/* Name - English */}
        <label className="rg-field">
          <span className="rg-field-form-label">{t("form.name")}</span>
          <input
            className="rg-input"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </label>
        {/* Name - Albanian */}
        <label className="rg-field">
          <span className="rg-field-form-label rg-field-label-sq">
            {t("form.name")} (SQ)
          </span>
          <input
            className="rg-input rg-input-sq"
            placeholder="Emri në shqip (opsionale)"
            value={form.nameSq}
            onChange={(e) => set("nameSq", e.target.value)}
          />
        </label>
        {/* Icon */}
        <label className="rg-field">
          <span className="rg-field-form-label">{t("categoryForm.icon")}</span>
          <input
            className="rg-input"
            placeholder="🍽️"
            value={form.icon}
            onChange={(e) => set("icon", e.target.value)}
          />
        </label>
        {/* Cover image upload */}
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
      {/* Cover image preview */}
      {form.cover && (
        <div className="rg-image-preview">
          <img src={form.cover} alt="Preview" />
        </div>
      )}
      {/* Note - English */}
      <label className="rg-field">
        <span className="rg-field-form-label">{t("categoryForm.note")}</span>
        <input
          className="rg-input"
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
        />
      </label>
      {/* Note (Albanian) */}
      <label className="rg-field">
        <span className="rg-field-form-label rg-field-label-sq">
          {t("categoryForm.note")} (SQ)
        </span>
        <input
          className="rg-input rg-input-sq"
          value={form.noteSq}
          onChange={(e) => set("noteSq", e.target.value)}
        />
      </label>
      {/* Error message */}
      {error && <p className="rg-auth-error">{error}</p>}

      <div className="rg-form-actions">
        <button
          type="button"
          className="rg-btn rg-btn-ghost"
          onClick={onCancel}
        >
          {t("form.cancel")}
        </button>
        <button
          type="submit"
          className="rg-btn rg-btn-primary"
          disabled={busy || uploading}
        >
          {busy
            ? t("form.saving")
            : initial
              ? t("form.saveChanges")
              : t("categoryForm.createCategory")}
        </button>
      </div>
    </form>
  );
}

export default AdminCategoryForm;
