import { useImageUpload } from "../hooks/useImageUpload";
import "./ImageUploadField.css";

export function ImageUploadField({ label, value, onChange, accept = "image/jpeg,image/png,image/webp,image/gif" }) {
  const { upload, uploading, error } = useImageUpload();

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const publicUrl = await upload(file);
      onChange(publicUrl);
    } catch {
      // error surfaced below via `error`
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="rg-field">
      {label && <span className="rg-field-form-label">{label}</span>}

      <div className="rg-image-upload">
        {value ? (
          <div className="rg-image-upload-preview">
            <img src={value} alt="Preview" />
            <button
              type="button"
              className="rg-image-upload-remove"
              onClick={() => onChange("")}
              aria-label="Remove image"
              title="Remove image"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="rg-image-upload-empty">No image</div>
        )}

        <label className="rg-image-upload-btn">
          <input type="file" accept={accept} onChange={handleFileChange} disabled={uploading} hidden />
          {uploading ? "Uploading…" : value ? "Change photo" : "Upload photo"}
        </label>
      </div>

      {error && <span className="rg-upload-status rg-upload-error">{error}</span>}
    </div>
  );
}

export default ImageUploadField;