import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { adminReadLimiter, adminWriteLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { categorySchema } from '../validators/categoryValidator.js';

const router = express.Router();

router.get("/", verifyToken, requireAdmin, adminReadLimiter, getCategories);
router.post("/", verifyToken, requireAdmin, adminWriteLimiter, validate(categorySchema), createCategory);
router.put("/:id", verifyToken, requireAdmin, adminWriteLimiter, validate(categorySchema), updateCategory);
router.delete("/:id", verifyToken, requireAdmin, adminWriteLimiter, deleteCategory);

export default router;