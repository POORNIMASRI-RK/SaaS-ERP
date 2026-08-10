import express from 'express';
import { getHrmsConfig, saveHrmsConfig } from '../controllers/hrmsConfigController.js';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

// Match both / and /config
router.get('/', getHrmsConfig);
router.get('/config', getHrmsConfig);
router.post('/', saveHrmsConfig);
router.post('/config', saveHrmsConfig);

export default router;
