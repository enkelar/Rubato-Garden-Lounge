import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import cache from "../utils/cache.js";

// Returns the Albanian value if lang is 'sq' and it's set, otherwise falls back to English
function pick(base, sq, lang) {
    if (lang === 'sq' && sq) return sq;
    return base;
}

// Reads language from query string and returns 'sq' or 'en
function getLang(req) {
    return req.query.lang === 'sq' ? 'sq' : 'en';
}

// GET /api/menu - get all categories home page
export const getMenuData = async (req, res) => {
    try {
        const lang = getLang(req); // Determine language for localization
        const cacheKey = `menu:${lang}`; // Build a cache key based on language
        const cached = cache.get(cacheKey); // Check is response is already cached
        if (cached) return res.status(200).json(cached);

        // Fetch all categories and sort them by name
        const categories = await categoryModel.find().sort({ name: 1 });
        // Convert category data into the preferred language
        const localized = categories.map(cat => ({
            _id: cat._id,
            slug: cat.slug,
            name: pick(cat.name, cat.nameSq, lang),
            icon: cat.icon,
            cover: cat.cover,
            note: pick(cat.note, cat.noteSq, lang)
        }));

        // Prepare response payload (core info)
        const payload = { categories: localized };
        // Save payload in cache
        cache.set(cacheKey, payload);
        res.status(200).json(payload);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// GET /api/menu/:slug - get products by category
export const getProductsByCategory = async (req, res) => {
    try {
        const slug = req.params.slug;
        const lang = getLang(req);
        const cacheKey = `menu:${slug}:${lang}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

        // Find category by slug
        const category = await categoryModel.findOne({ slug });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Find all products that belong to category
        const products = await productModel.find({ category: category._id });

        // Loops through products, diplays the lists
        const items = products.map(product => ({
            id: product._id.toString(),
            name: pick(product.name, product.nameSq, lang),
            description: pick(product.description, product.descriptionSq, lang),
            price: product.price,
            image: product.image
        }));

        // Final response structure
        const payload = {
            success: true,
            data: {
                slug: category.slug,
                name: pick(category.name, category.nameSq, lang),
                icon: category.icon,
                cover: category.cover,
                note: pick(category.note, category.noteSq, lang),
                items
            }
        };

        cache.set(cacheKey, payload);
        res.status(200).json(payload);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// GET /api/menu/:slug/:productId - get single item by category and product ID
export const getProductById = async (req, res) => {
    try {
        const lang = getLang(req);
        const slug = req.params.slug; // Read params from URL
        const productId = req.params.productId;

        // Find category by slug first
        const category = await categoryModel.findOne({ slug });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Find product that matched both ID and category
        const product = await productModel.findOne({
            _id: productId,
            category: category._id
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
            success: true,
            data: {
                category: {
                    slug: category.slug,
                    name: pick(category.name, category.nameSq, lang),
                    icon: category.icon
                },
                item: {
                    id: product._id.toString(),
                    name: pick(product.name, product.nameSq, lang),
                    description: pick(product.description, product.descriptionSq, lang),
                    price: product.price,
                    image: product.image,
                    details: pick(product.details, product.detailsSq, lang)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
