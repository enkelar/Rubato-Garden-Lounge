import { useState } from "react";
import { useAdminApi } from "../services/adminApi";
import { useLanguage } from "../context/LanguageContext";
import { useFormState } from "../hooks/useFormState";
import ImageUploadField from "./ImageUploadField";
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
  const [form, set] = useFormState(
  initial
    ? {
        name: initial.name || "",
        nameSq: initial.nameSq || "",
        icon: initial.icon || "",
        cover: initial.cover || "",
        note: initial.note || "",
        noteSq: initial.noteSq || "",
      }
    : { ...EMPTY }
);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false); // save-in-progress state

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
      let saved;
      if (initial) {
        const res = await api.updateCategory(initial._id, form);
        saved = res.category;
      } else {
        const res = await api.createCategory(form);
        saved = res.category;
      }
  onDone(saved);
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
         <ImageUploadField
           label={t("categoryForm.cover")}
           value={form.cover}
           onChange={(url) => set("cover", url)}
         />
      </div>
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
      {(error) && <p className="rg-auth-error">{error }</p>}

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
          disabled={busy}
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
