const SIGNATURES = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]], // "GIF8"
};

function matchesSignature(buffer, bytes) {
  return bytes.every((b, i) => buffer[i] === b);
}

export function isValidImageSignature(buffer, contentType) {
  if (contentType === 'image/webp') {
    // RIFF....WEBP — bytes 0-3 "RIFF", bytes 8-11 "WEBP"
    const riff = buffer.slice(0, 4).toString('ascii') === 'RIFF';
    const webp = buffer.slice(8, 12).toString('ascii') === 'WEBP';
    return riff && webp;
  }

  if (contentType === 'image/avif') {
    const ftyp = buffer.slice(4, 8).toString('ascii') === 'ftyp';
    const brand = buffer.slice(8, 12).toString('ascii');
    return ftyp && (brand === 'avif' || brand === 'avis');
  }

  const candidates = SIGNATURES[contentType];
  if (!candidates) return false;
  return candidates.some((sig) => matchesSignature(buffer, sig));
}

export default isValidImageSignature;