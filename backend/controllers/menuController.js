import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import cache from "../utils/cache.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

function pick(base, sq, lang) {
  if (lang === 'sq' && sq) return sq;
  return base;
}

function getLang(req) {
  return req.query.lang === 'sq' ? 'sq' : 'en';
}

function getSection(req) {
  return req.query.section === 'night' ? 'night' : 'day';
}

export const getMenuData = asyncHandler(async (req, res) => {
  const lang = getLang(req);
  const section = getSection(req);
  const cacheKey = `menu:${lang}:${section}`;
  const cached = cache.get(cacheKey);

  res.set(
    "Cache-Control",
    "public, max-age=60, s-maxage=300, stale-while-revalidate=86400"
  );

  if (cached) {
    return res.status(200).json(cached);
  }

  const filter =
    section === "night"
      ? { isNightMenu: true }
      : { isNightMenu: { $ne: true } };

  const categories = await categoryModel
    .find(filter)
    .select("_id slug name nameSq icon cover note noteSq order")
    .sort({ order: 1, name: 1 })
    .lean();

  const payload = {
    categories: categories.map((category) => ({
      _id: category._id,
      slug: category.slug,
      name: pick(category.name, category.nameSq, lang),
      icon: category.icon,
      cover: category.cover,
      note: pick(category.note, category.noteSq, lang),
    })),
  };

  cache.set(cacheKey, payload, 300);

  return res.status(200).json(payload);
});

export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const lang = getLang(req);
  const cacheKey = `menu:${slug}:${lang}`;
  const cached = cache.get(cacheKey);

  res.set(
    "Cache-Control",
    "public, max-age=60, s-maxage=300, stale-while-revalidate=86400"
  );

  if (cached) {
    return res.status(200).json(cached);
  }

  const category = await categoryModel
    .findOne({ slug })
    .select("_id slug name nameSq icon cover note noteSq isNightMenu")
    .lean();

  if (!category) {
    throw httpError(404, "Category not found");
  }

  const products = await productModel
    .find({ category: category._id })
    .select("_id name nameSq description descriptionSq price image")
    .sort({ name: 1 })
    .lean();

  const payload = {
    success: true,
    data: {
      slug: category.slug,
      name: pick(category.name, category.nameSq, lang),
      icon: category.icon,
      cover: category.cover,
      note: pick(category.note, category.noteSq, lang),
      isNightMenu: category.isNightMenu,
      items: products.map((product) => ({
        id: product._id.toString(),
        name: pick(product.name, product.nameSq, lang),
        description: pick(
          product.description,
          product.descriptionSq,
          lang
        ),
        price: product.price,
        image: product.image,
      })),
    },
  };

  cache.set(cacheKey, payload, 300);

  return res.status(200).json(payload);
});

export const getProductById = asyncHandler(async (req, res) => {
  const lang = getLang(req);
  const { slug, productId } = req.params;
  const cacheKey = `item:${slug}:${productId}:${lang}`;
  const cached = cache.get(cacheKey);

  res.set(
    "Cache-Control",
    "public, max-age=60, s-maxage=300, stale-while-revalidate=86400"
  );

  if (cached) {
    return res.status(200).json(cached);
  }

  const category = await categoryModel
    .findOne({ slug })
    .select("_id slug name nameSq icon")
    .lean();

  if (!category) {
    throw httpError(404, "Category not found");
  }

  const product = await productModel
    .findOne({
      _id: productId,
      category: category._id,
    })
    .select("_id name nameSq description descriptionSq price image")
    .lean();

  if (!product) {
    throw httpError(404, "Product not found");
  }

  const payload = {
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
        description: pick(
          product.description,
          product.descriptionSq,
          lang
        ),
        price: product.price,
        image: product.image,
      },
    },
  };

  cache.set(cacheKey, payload, 300);

  return res.json(payload);
});