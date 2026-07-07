import express from 'express';
import { getImageUploadUrl } from '../controllers/uploadController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { adminWriteLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

router.post('/image-url', verifyToken, requireAdmin, adminWriteLimiter, getImageUploadUrl);

export default router;
