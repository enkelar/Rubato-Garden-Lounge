import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";

// Helper function to generate slug from name
function generateSlug(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

// GET /api/menu - get all categories home page
export const getMenuData = async (req, res) => {
    try {
        const categories = await categoryModel.find().sort({ name: 1 });
        res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// GET /api/menu/:slug - get products by category
export const getProductsByCategory = async (req, res) => {
    try {
        const slug = req.params.slug;
        const category = await categoryModel.findOne({ slug });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const products = await productModel.find({ category: category._id });

        // Loops through products, diplays the lists
        const items = products.map(product => ({
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image
        }));

        res.status(200).json({
            success: true,
            data: {
                slug: category.slug,
                name: category.name,
                description: category.description,
                icon: category.icon,
                cover: category.cover,
                note: category.note,
                items
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// GET /api/menu/:slug/:productId - get single item by category and product ID
export const getProductById = async (req, res) => {
    try {
        //captures the values from the route parameters
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
                    name: category.name,
                    icon: category.icon
                },
                item: {
                    id: product._id.toString(),
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image: product.image,
                    details: product.details
                },
                shareUrl
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
