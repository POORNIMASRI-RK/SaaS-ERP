import express from 'express';
import { getShifts, createShift } from '../controllers/shiftController.js';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', getShifts);
router.post('/', authorizeRoles('Super Admin', 'Company Admin', 'HR'), createShift);

export default router;
