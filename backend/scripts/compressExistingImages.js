import 'dotenv/config'; 
import sharp from 'sharp';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import connectDB from '../db.js';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../services/r2Client.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';


const MAX_DIMENSION = 1600; // longest side, in pixels
const QUALITY = 80;         // 0–100
const MIN_SIZE_TO_BOTHER = 300 * 1024; // skip anything already under 300KB

// Downloads one image from R2, compresses it, and re-uploads it to the
// SAME key — so no database update is needed, the URL never changes.
async function compressAndReupload(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith(R2_PUBLIC_URL)) return null; // placeholder/external — skip

  const key = imageUrl.slice(R2_PUBLIC_URL.length).replace(/^\/+/, '');
  if (!key) return null;

  const getResult = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
  const chunks = [];
  for await (const chunk of getResult.Body) chunks.push(chunk);
  const originalBuffer = Buffer.concat(chunks);
  const originalSize = originalBuffer.length;

  if (originalSize < MIN_SIZE_TO_BOTHER) {
    return { key, skipped: true, reason: 'already small enough', originalSize };
  }

  const contentType = getResult.ContentType || 'image/jpeg';
  const format = contentType.split('/')[1] || 'jpeg';

  let pipeline = sharp(originalBuffer).resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: 'inside',            // never crops, only shrinks if larger
    withoutEnlargement: true, // never upscales a smaller image
  });

  if (format === 'png') pipeline = pipeline.png({ quality: QUALITY });
  else if (format === 'webp') pipeline = pipeline.webp({ quality: QUALITY });
  else if (format === 'avif') pipeline = pipeline.avif({ quality: QUALITY });
  else pipeline = pipeline.jpeg({ quality: QUALITY });

  const compressedBuffer = await pipeline.toBuffer();

  if (compressedBuffer.length >= originalSize) {
    return { key, skipped: true, reason: 'compression did not help', originalSize };
  }

  await r2Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: compressedBuffer,
    ContentType: contentType,
  }));

  return {
    key,
    skipped: false,
    originalSize,
    newSize: compressedBuffer.length,
    savedPercent: Math.round((1 - compressedBuffer.length / originalSize) * 100),
  };
}

async function run() {
  await connectDB();
  console.log('Connected to database');

  const products = await Product.find({});
  const categories = await Category.find({});

  const items = [
    ...products.map(p => ({ type: 'product', name: p.name, url: p.image })),
    ...categories.map(c => ({ type: 'category', name: c.name, url: c.cover })),
  ];

  console.log(`Found ${items.length} items to check\n`);

  let processed = 0, skipped = 0, failed = 0, totalSaved = 0;

  for (const item of items) {
    try {
      const result = await compressAndReupload(item.url);
      if (!result) continue; // no R2 image (placeholder/external), nothing to do

      if (result.skipped) {
        console.log(`- ${item.type} "${item.name}": skipped (${result.reason})`);
        skipped++;
        continue;
      }

      console.log(
        `✓ ${item.type} "${item.name}": ${(result.originalSize / 1024).toFixed(0)}KB → ${(result.newSize / 1024).toFixed(0)}KB (-${result.savedPercent}%)`
      );
      totalSaved += result.originalSize - result.newSize;
      processed++;
    } catch (err) {
      console.error(`✗ ${item.type} "${item.name}": failed — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Compressed: ${processed}, skipped: ${skipped}, failed: ${failed}`);
  console.log(`Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});