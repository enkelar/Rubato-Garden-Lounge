import express from 'express';
import menuRoutes from './menuRoutes.js';

const router = express.Router();

// Use the menu routes for /api/menu
router.use('/menu', menuRoutes);    

export default router;