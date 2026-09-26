
const MAX_DIMENSION = 1600; // longest side, in pixels
const QUALITY = 0.8; // 0–1, applies to jpeg/webp

// Resizes and re-encodes an image file client-side before upload.
// Returns a new File with the same name/type but a smaller payload.
export async function compressImage(file) {
  // Skip compression for types canvas can't meaningfully shrink, or if the file is already small enough to not bother.
  if (file.size < 300 * 1024) return file; 

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, file.type, QUALITY)
  );

  // Fallback: if compression somehow produced a larger file, keep the original.
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], file.name, { type: file.type });
}

export default compressImage;