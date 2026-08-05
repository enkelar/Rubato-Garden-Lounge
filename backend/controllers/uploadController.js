import crypto from 'crypto';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../services/r2Client.js';
import { isValidImageSignature } from '../utils/fileSignature.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const getImageUploadUrl = asyncHandler(async (req, res) => {
  if (!R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw httpError(500, 'R2 is not configured on the server.');
  }

  const { contentType, fileSize } = req.body;

  if (typeof fileSize !== 'number' || fileSize <= 0 || fileSize > MAX_FILE_SIZE_BYTES) {
    throw httpError(400, `File size must be between 1 byte and ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
  }

  const extension = ALLOWED_TYPES[contentType];
  if (!extension) {
    throw httpError(400, 'Unsupported image type. Use JPEG, PNG, WEBP, or GIF');
  }

  const key = `products/${crypto.randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadURL = await getSignedUrl(r2Client, command, { expiresIn: 300 });

  res.status(200).json({
    uploadURL,
    publicUrl: `${R2_PUBLIC_URL}/${key}`,
  });
});

export const verifyImageUpload = asyncHandler(async (req, res) => {
  const { key, contentType } = req.body;
  if (!key || !contentType) throw httpError(400, 'key and contentType are required.');
  if (!key.startsWith('products/')) throw httpError(400, 'Invalid key.');

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Range: 'bytes=0-15',
  });

  let buffer;
  try {
    const result = await r2Client.send(command);
    buffer = Buffer.from(await result.Body.transformToByteArray());
  } catch {
    throw httpError(404, 'Uploaded object not found.');
  }

  const valid = isValidImageSignature(buffer, contentType);

  if (!valid) {
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    throw httpError(400, 'File content does not match declared image type. Upload rejected.');
  }

  res.status(200).json({ valid: true });
});