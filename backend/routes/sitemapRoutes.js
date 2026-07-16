import express from 'express';
import categoryModel from '../models/categoryModel.js';
import productModel from '../models/productModel.js';

const router = express.Router();
const SITE_URL = 'https://yourdomain.com'; // match SEO.jsx

router.get('/', async (req, res) => {
  try {
    const categories = await categoryModel.find();
    const products = await productModel.find();

    const urls = [
      `${SITE_URL}/`,
      ...categories.map(c => `${SITE_URL}/menu/${c.slug}`),
      ...products.map(p => `${SITE_URL}/menu/${categories.find(c => String(c._id) === String(p.category))?.slug}/${p._id}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
      </urlset>`;
    res.type('application/xml').send(xml);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;