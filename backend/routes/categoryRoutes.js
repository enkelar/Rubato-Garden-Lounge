import express from 'express';
import { getCategories , createCategory , updateCategory , deleteCategory } from '../controllers/categoryController.js';
import { verifyToken , requireAdmin } from '../middleware/authMiddleware.js';
import { adminLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

router.get("/", verifyToken, requireAdmin, adminLimiter, getCategories);

router.post("/", verifyToken, requireAdmin, adminLimiter, createCategory);

router.put("/:id", verifyToken, requireAdmin, adminLimiter, updateCategory);

router.delete("/:id", verifyToken, requireAdmin, adminLimiter, deleteCategory);

export default router;