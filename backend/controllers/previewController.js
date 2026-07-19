import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";

const SITE_URL = process.env.SITE_URL || 'https://yourdomain.com';
const SITE_NAME = "Rubato Garden Lounge";
const DEFAULT_IMAGE = `${SITE_URL}/og-cover.jpg`;
const DEFAULT_DESCRIPTION = "Rubato Garden Lounge — a garden lounge menu featuring soups, pasta, risotto, wood-fired pizza, and more.";

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPreviewHtml({ title, description, image, url, type = 'website' }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${url}" />

<meta property="og:type" content="${type}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(fullTitle)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${url}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${image}" />
</head>
<body>
<h1>${escapeHtml(fullTitle)}</h1>
<p>${escapeHtml(description)}</p>
</body>
</html>`;
}

export async function previewHome(req, res) {
  res.type('html').send(renderPreviewHtml({
    title: null,
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_IMAGE,
    url: `${SITE_URL}/`,
  }));
}

export async function previewCategory(req, res, next) {
  const category = await categoryModel.findOne({ slug: req.params.slug });
  if (!category) return next();

  res.type('html').send(renderPreviewHtml({
    title: category.name,
    description: category.note || DEFAULT_DESCRIPTION,
    image: category.cover || DEFAULT_IMAGE,
    url: `${SITE_URL}/menu/${category.slug}`,
  }));
}

export async function previewProduct(req, res, next) {
  const category = await categoryModel.findOne({ slug: req.params.slug });
  const product = category && await productModel.findOne({ _id: req.params.productId, category: category._id });
  if (!category || !product) return next();

  res.type('html').send(renderPreviewHtml({
    title: product.name,
    description: product.description || DEFAULT_DESCRIPTION,
    image: product.image || DEFAULT_IMAGE,
    url: `${SITE_URL}/menu/${category.slug}/${product._id}`,
    type: 'product',
  }));
}