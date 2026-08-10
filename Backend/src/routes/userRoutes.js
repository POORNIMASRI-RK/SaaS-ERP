import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  inviteUser,
  updateUser,
  toggleUserStatus,
  sendPasswordResetInvite,
  deleteUser,
  getInvitationDetails,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import { validateUserPayload } from '../middleware/validateUser.js';

const router = express.Router();

// Public route: Verify invitation token for Set Password page (NO auth token required)
router.get('/invite/:token', getInvitationDetails);

// Protected routes requiring authentication & tenant isolation
router.use(protect);
router.use(enforceTenant);

router.get('/', getUsers);
router.get('/:id', getUserById);

router.post(
  '/',
  authorizeRoles('Super Admin', 'Company Admin', 'HR', 'Manager'),
  validateUserPayload,
  createUser
);

router.post(
  '/invite',
  authorizeRoles('Super Admin', 'Company Admin', 'HR', 'Manager'),
  inviteUser
);

router.put(
  '/:id',
  authorizeRoles('Super Admin', 'Company Admin', 'HR', 'Manager'),
  validateUserPayload,
  updateUser
);

router.patch(
  '/:id/status',
  authorizeRoles('Super Admin', 'Company Admin', 'HR'),
  toggleUserStatus
);

router.post(
  '/:id/reset-password-invite',
  authorizeRoles('Super Admin', 'Company Admin', 'HR'),
  sendPasswordResetInvite
);

router.delete(
  '/:id',
  authorizeRoles('Super Admin', 'Company Admin', 'HR'),
  deleteUser
);

export default router;
