import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import {
  getQRCodeLogs,
  generateItemQRCode,
  processQRScan,
  getItemTraceability,
} from '../controllers/qrTrackingController.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

router.get('/logs', getQRCodeLogs);
router.post('/scan', processQRScan);
router.patch('/generate/:itemId', generateItemQRCode);
router.get('/traceability/:itemId', getItemTraceability);

export default router;
