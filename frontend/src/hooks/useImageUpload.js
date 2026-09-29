import { useState } from "react";
import { useAdminApi } from "../services/adminApi";

const MAX_DIMENSION = 1000; // px, longest side
const WEBP_QUALITY = 0.82;
const SKIP_BELOW_BYTES = 80 * 1024; // already small, leave it alone

// Resize + convert to WebP. Falls back to the original file if anything fails.
async function compressImage(file) {
  // GIFs may be animated; canvas would flatten them
  if (file.type === "image/gif") return file;
  if (file.size < SKIP_BELOW_BYTES && file.type === "image/webp") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
    );

    // Keep the original if WebP encoding failed or made it bigger
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
      type: "image/webp",
    });
  } catch {
    return file;
  }
}

export function useImageUpload() {
  const api = useAdminApi();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function upload(originalFile) {
    setError(null);
    setUploading(true);
    try {
      const file = await compressImage(originalFile);

      const { uploadURL, publicUrl } = await api.getImageUploadUrl(file.type, file.size);

      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: file,
      });
      if (!putRes.ok) throw new Error("Image upload to storage failed.");

      const key = new URL(uploadURL).pathname.replace(/^\/+/, "");
      await api.verifyImageUpload(key, file.type);

      return publicUrl;
    } catch (err) {
      setError(err.message || "Image upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, error, setError };
}

export default useImageUpload;