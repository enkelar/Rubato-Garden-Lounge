import {S3Client} from "@aws-sdk/client-s3";

// Cloudflare account ID from .env
const accountId = process.env.R2_ACCOUNT_ID;

// Check that all R2 credentials exist
if(!accountId || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.warn("R2 credentials are not fully configures - image uploads will fail.");
}

// Create and export an S3 client configured for Cloudflare R2
// this client will be used for uploads
export const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
