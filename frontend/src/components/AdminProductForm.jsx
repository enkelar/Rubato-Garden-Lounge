import { useState } from "react";
import { useAdminApi } from "../services/adminApi";
import "./adminProductForm.css";

const EMPTY = { name: "", category: "", price: "", image: "", description: "", details: "" };

export function AdminProductForm({ initial, categories, onDone, onCancel }) {
  const api = useAdminApi();
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name || "",
          category: initial.category?._id || initial.category || "",
          price: initial.price ?? "",
          image: initial.image || "",
          description: initial.description || "",
          details: initial.details || "",
        }
      : { ...EMPTY, category: categories[0]?._id || "" }
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
      // Ask backend for a presigned R2 PUT URL for this file's content type
      const { uploadURL, publicUrl } = await api.getImageUploadUrl(file.type);

      //Upload the raw file bytes straight to R2 (bypasses the server entirely)
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putRes.ok) throw new Error("Image upload to storage failed.");

      //Store just the public URL
      set("image", publicUrl);
    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting the same file later
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.category || !form.price) {
      setError("Name, category, and price are required.");
      return;
    }

    const payload = { ...form, price: Number(form.price) };

    setBusy(true);
    try {
      if (initial) {
        await api.updateProduct(initial._id, payload);
      } else {
        await api.createProduct(payload);
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
          <span className="rg-field-form-label">Name</span>
          <input className="rg-input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </label>

        <label className="rg-field">
          <span className="rg-field-form-label">Category</span>
          <select className="rg-input" required value={form.category} onChange={(e) => set("category", e.target.value)}>
            <option value="" disabled>Select a category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="rg-field">
          <span className="rg-field-form-label">Price ($)</span>
          <input className="rg-input" type="number" step="0.01" min="0" required value={form.price} onChange={(e) => set("price", e.target.value)} />
        </label>

        <label className="rg-field">
          <span className="rg-field-form-label">Photo</span>
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
        <span className="rg-field-form-label">Description</span>
        <textarea className="rg-input rg-textarea" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </label>

      <label className="rg-field">
        <span className="rg-field-form-label">Details</span>
        <textarea className="rg-input rg-textarea" rows={2} value={form.details} onChange={(e) => set("details", e.target.value)} />
      </label>

      {error && <p className="rg-auth-error">{error}</p>}

      <div className="rg-form-actions">
        <button type="button" className="rg-btn rg-btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="rg-btn rg-btn-primary" disabled={busy || uploading}>
          {busy ? "Saving…" : initial ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}

export default AdminProductForm;