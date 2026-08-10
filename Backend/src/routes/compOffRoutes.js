import express from 'express';
import { getCompOffCredits, allocateCompOff } from '../controllers/compOffController.js';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', getCompOffCredits);
router.post('/allocate', authorizeRoles('Super Admin', 'Company Admin', 'HR', 'Manager'), allocateCompOff);

export default router;
