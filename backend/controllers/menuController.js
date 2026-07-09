import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import cache from "../utils/cache.js";

// Returns the Albanian value if lang is 'sq' and it's set, otherwise falls back to English
function pick(base, sq, lang){
    if(lang === 'sq' && sq) return sq;
    return base;
}

function getLang(req){
    return req.query.lang === 'sq' ? 'sq' : 'en';
}

// GET /api/menu - get all categories home page
export const getMenuData = async (req, res) => {
    try {
        const lang = getLang(req);
        const cacheKey = `menu:${lang}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

        const categories = await categoryModel.find().sort({ name: 1 });
        const localized = categories.map(cat => ({
            _id: cat._id,
            slug: cat.slug,
            name: pick(cat.name, cat.nameSq, lang),
            description: pick(cat.description, cat.descriptionSq, lang),
            icon: cat.icon,
            cover: cat.cover,
            note: pick(cat.note, cat.noteSq, lang)
        }));
        const payload = { categories: localized };

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

        const category = await categoryModel.findOne({ slug });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const products = await productModel.find({ category: category._id });

        // Loops through products, diplays the lists
        const items = products.map(product => ({
            id: product._id.toString(),
            name: pick(product.name, product.nameSq, lang),
            description: pick(product.description, product.descriptionSq, lang),
            price: product.price,
            image: product.image
        }));

        const payload = {
            success: true,
            data: {
                slug: category.slug,
                name: pick(category.name, category.nameSq, lang),
                description: pick(category.description, category.descriptionSq, lang),
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
        const slug = req.params.slug;
        const productId = req.params.productId;

        const category = await categoryModel.findOne({ slug });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const product = await productModel.findOne({
            _id: productId,
            category: category._id
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const shareUrl = `${req.protocol}://${req.get('host')}/menu/${slug}/${product._id.toString()}`;

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
                },
                shareUrl
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
