import express from 'express';
import { adminLogin} from '../controllers/authController.js';
import {loginLimiter} from '../middleware/rateLimiters.js';

const router = express.Router();

router.post("/login", loginLimiter, adminLogin);

export default router;