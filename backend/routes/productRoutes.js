import express from "express";
import { getAllProducts, getProductsByCategoryId, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";
import { adminReadLimiter, adminWriteLimiter } from "../middleware/rateLimiters.js";
import { validate } from '../middleware/validate.js';
import { productSchema } from '../validators/productValidator.js';

const router = express.Router();

router.get("/", verifyToken, requireAdmin, adminReadLimiter, getAllProducts);
router.get("/category/:categoryId", verifyToken, requireAdmin, adminReadLimiter, getProductsByCategoryId);
router.post("/", verifyToken, requireAdmin, adminWriteLimiter,validate(productSchema), createProduct);
router.put("/:id", verifyToken, requireAdmin, adminWriteLimiter,validate(productSchema), updateProduct);
router.delete("/:id", verifyToken, requireAdmin, adminWriteLimiter, deleteProduct);

export default router;