import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../services/r2Client.js';

export async function deleteR2ObjectByUrl(url) {
  if (!url || !R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL)) return;

  const key = url.slice(R2_PUBLIC_URL.length).replace(/^\/+/, '');
  if (!key) return;

  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
  } catch (err) {
    console.error('Failed to delete R2 object:', key, err.message);
  }
}

export default deleteR2ObjectByUrl;