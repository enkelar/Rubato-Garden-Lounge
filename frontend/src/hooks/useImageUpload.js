import { useState } from "react";
import { useAdminApi } from "../services/adminApi";
import { compressImage } from "../utils/compressImage";


export function useImageUpload() {
  const api = useAdminApi();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function upload(file) {
    setError(null);
    setUploading(true);
    try {
      const compressed = await compressImage(file); 
      const { uploadURL, publicUrl } = await api.getImageUploadUrl(compressed.type, compressed.size);

      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: compressed,
      });
      if (!putRes.ok) throw new Error("Image upload to storage failed.");

      // Extract the R2 key from the public URL and verify the file signature
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