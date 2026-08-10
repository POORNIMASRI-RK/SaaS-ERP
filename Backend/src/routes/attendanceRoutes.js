import express from 'express';
import {
  checkIn,
  checkOut,
  biometricSync,
  getAttendanceRecords,
  correctAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public hardware biometric punch sync route
router.post('/biometric-sync', biometricSync);

// Protected routes
router.use(protect);
router.use(enforceTenant);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/', getAttendanceRecords);
router.patch('/:id/correct', authorizeRoles('Super Admin', 'Company Admin', 'HR'), correctAttendance);

export default router;
