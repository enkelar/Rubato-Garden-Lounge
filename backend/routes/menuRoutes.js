import express from 'express';
import {getMenuData, getProductsByCategory, getProductById} from '../controllers/menuController.js';

const router = express.Router();

// GET /api/menu - get all categories
router.get('/', getMenuData);

// GET /api/menu/:slug - get products by category
router.get('/:slug', getProductsByCategory);

// GET /api/menu/:slug/:productId - get single item by category and product ID
router.get('/:slug/:productId', getProductById);

export default router;