import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import cache from "../utils/cache.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

const PUBLIC_CACHE_SECONDS = 300;

function pick(base, sq, lang) {
  if (lang === 'sq' && sq) return sq;
  return base;
}

function getLang(req) {
  return req.query.lang === 'sq' ? 'sq' : 'en';
}

export const getMenuData = asyncHandler(async (req, res) => {
  const lang = getLang(req);
  const cacheKey = `menu:${lang}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    res.set('Cache-Control', `public, max-age=${PUBLIC_CACHE_SECONDS}`);
    return res.status(200).json(cached);
  }

  const categories = await categoryModel.find().sort({ order: 1, name: 1 });

  const localized = categories.map(cat => ({
    _id: cat._id,
    slug: cat.slug,
    name: pick(cat.name, cat.nameSq, lang),
    icon: cat.icon,
    cover: cat.cover,
    note: pick(cat.note, cat.noteSq, lang),
  }));

  const payload = { categories: localized };

  cache.set(cacheKey, payload);
  res.set('Cache-Control', `public, max-age=${PUBLIC_CACHE_SECONDS}`);
  res.status(200).json(payload);
});

export const getProductsByCategory = asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  const lang = getLang(req);
  const cacheKey = `menu:${slug}:${lang}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    res.set('Cache-Control', `public, max-age=${PUBLIC_CACHE_SECONDS}`);
    return res.status(200).json(cached);
  }

  const category = await categoryModel.findOne({ slug });
  if (!category) throw httpError(404, 'Category not found');

  const products = await productModel.find({ category: category._id });

  const items = products.map(product => ({
    id: product._id.toString(),
    name: pick(product.name, product.nameSq, lang),
    description: pick(product.description, product.descriptionSq, lang),
    price: product.price,
    image: product.image,
  }));

  const payload = {
    success: true,
    data: {
      slug: category.slug,
      name: pick(category.name, category.nameSq, lang),
      icon: category.icon,
      cover: category.cover,
      note: pick(category.note, category.noteSq, lang),
      items,
    },
  };

  cache.set(cacheKey, payload);
  res.set('Cache-Control', `public, max-age=${PUBLIC_CACHE_SECONDS}`);
  res.status(200).json(payload);
});

export const getProductById = asyncHandler(async (req, res) => {
  const lang = getLang(req);
  const slug = req.params.slug;
  const productId = req.params.productId;

  const category = await categoryModel.findOne({ slug });
  if (!category) throw httpError(404, 'Category not found');

  const product = await productModel.findOne({
    _id: productId,
    category: category._id,
  });
  if (!product) throw httpError(404, 'Product not found');

  res.set('Cache-Control', `public, max-age=${PUBLIC_CACHE_SECONDS}`);
  res.json({
    success: true,
    data: {
      category: {
        slug: category.slug,
        name: pick(category.name, category.nameSq, lang),
        icon: category.icon,
      },
      item: {
        id: product._id.toString(),
        name: pick(product.name, product.nameSq, lang),
        description: pick(product.description, product.descriptionSq, lang),
        price: product.price,
        image: product.image,
        details: pick(product.details, product.detailsSq, lang),
      },
    },
  });
});