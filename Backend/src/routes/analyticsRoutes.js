import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import { getRealTimeKPIs } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

router.get('/kpis', getRealTimeKPIs);

export default router;
