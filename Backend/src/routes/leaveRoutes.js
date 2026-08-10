import express from 'express';
import {
  getLeaveTypes,
  saveLeaveType,
  getLeaveBalances,
  applyLeave,
  getLeaveRequests,
  getPendingApprovals,
  approveByManager,
  approveByHr,
  rejectLeave,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

router.get('/types', getLeaveTypes);
router.post('/types', authorizeRoles('Super Admin', 'Company Admin', 'HR'), saveLeaveType);

router.get('/balances', getLeaveBalances);
router.post('/apply', applyLeave);

// Leave Requests & Approvals List (Accessible to all users; non-approvers see own, approvers see company/team)
router.get('/requests', getLeaveRequests);
router.get('/approvals', getLeaveRequests);

// Approval & Rejection Endpoints (Handles both /:id and /requests/:id paths)
const approverRoles = authorizeRoles('Super Admin', 'Company Admin', 'HR', 'Manager', 'Production Manager', 'Team Leader');

router.patch('/:id/approve', approverRoles, approveByManager);
router.patch('/:id/approve-manager', approverRoles, approveByManager);
router.patch('/:id/approve-hr', approverRoles, approveByHr);
router.patch('/requests/:id/approve-manager', approverRoles, approveByManager);
router.patch('/requests/:id/approve-hr', approverRoles, approveByHr);

router.patch('/:id/reject', approverRoles, rejectLeave);
router.patch('/requests/:id/reject', approverRoles, rejectLeave);

export default router;
