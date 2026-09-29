import 'dotenv/config';
import crypto from 'crypto';
import sharp from 'sharp';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import connectDB from '../db.js';
import mongoose from 'mongoose';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../services/r2Client.js';
import { deleteR2ObjectByUrl } from '../utils/r2Delete.js';

const DRY_RUN = process.argv.includes('--dry-run');
const MAX_DIMENSION = 1000;
const QUALITY = 80;

function isR2Url(url) {
  return typeof url === 'string' && R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL);
}

function keyFromUrl(url) {
  return url.slice(R2_PUBLIC_URL.length).replace(/^\/+/, '');
}

async function downloadObject(key) {
  const res = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
  return Buffer.from(await res.Body.transformToByteArray());
}

// Returns the new public URL, or null if the image should be left alone
async function convertImage(url) {
  if (!isR2Url(url)) { console.log(`  skipped (not an R2 url): ${url}`); return null; }
  if (url.toLowerCase().endsWith('.webp')) { console.log('  skipped (already webp)'); return null; }
  if (url.toLowerCase().endsWith('.gif')) { console.log('  skipped (gif)'); return null; }

  const original = await downloadObject(keyFromUrl(url));

  const output = await sharp(original)
    .rotate() 
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  console.log(`  ${(original.length / 1024).toFixed(0)} KiB -> ${(output.length / 1024).toFixed(0)} KiB`);

  if (output.length >= original.length) {
    console.log('  skipped (not smaller)');
    return null;
  }
  if (DRY_RUN) return null;

  const newKey = `products/${crypto.randomUUID()}.webp`;
  await r2Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: newKey,
    Body: output,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  return `${R2_PUBLIC_URL}/${newKey}`;
}

async function migrateCollection(Model, field, label) {
  const docs = await Model.find({ [field]: { $exists: true, $ne: '' } });
  console.log(`\n${label}: ${docs.length} documents`);

  let converted = 0;
  for (const doc of docs) {
    const oldUrl = doc[field];
    console.log(`- ${doc.name}`);
    try {
      const newUrl = await convertImage(oldUrl);
      if (!newUrl) continue;

      // Update the DB first, delete the old file only after that succeeds
      doc[field] = newUrl;
      await doc.save();
      await deleteR2ObjectByUrl(oldUrl);
      converted++;
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }
  }
  console.log(`${label}: converted ${converted}`);
}

async function main() {
  await connectDB();
  console.log(DRY_RUN ? 'DRY RUN, nothing will be written' : 'LIVE RUN');

  await migrateCollection(Category, 'cover', 'Categories');
  await migrateCollection(Product, 'image', 'Products');

  await mongoose.connection.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});