import express from "express";
import { getProductsByCategoryId, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";
import { adminLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.get("/category/:categoryId", verifyToken, requireAdmin, adminLimiter, getProductsByCategoryId);

router.post("/", verifyToken, requireAdmin, adminLimiter, createProduct);

router.put("/:id", verifyToken, requireAdmin, adminLimiter, updateProduct);

router.delete("/:id", verifyToken, requireAdmin, adminLimiter, deleteProduct);

export default router;