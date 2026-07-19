import express from 'express';
import { isSocialBot } from '../utils/botDetect.js';
import { previewHome, previewCategory, previewProduct } from '../controllers/previewController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

function botOnly(fn) {
  return asyncHandler(async (req, res, next) => {
    if (!isSocialBot(req.headers['user-agent'])) return next();
    await fn(req, res, next);
  });
}

router.get('/', botOnly(previewHome));
router.get('/menu/:slug', botOnly(previewCategory));
router.get('/menu/:slug/:productId', botOnly(previewProduct));

export default router;