import express from 'express';
import { getImageUploadUrl, verifyImageUpload } from '../controllers/uploadController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { uploadLimiter  } from '../middleware/rateLimiters.js';

const router = express.Router();

router.post('/image-url', verifyToken, requireAdmin, uploadLimiter, getImageUploadUrl);
router.post('/verify', verifyToken, requireAdmin, uploadLimiter, verifyImageUpload);

export default router;
