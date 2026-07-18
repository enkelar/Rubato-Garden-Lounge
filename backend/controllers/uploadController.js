import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../services/r2Client.js';
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