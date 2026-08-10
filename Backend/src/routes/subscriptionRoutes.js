import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  togglePlanStatus,
  onboardTenantCompany,
  getAllTenantSubscriptions,
  updateCompanySubscription,
  toggleTenantCompanyStatus,
  renewTenantSubscription,
  deleteTenantCompany,
  getCompanySubscriptionDetails,
  getSubscriptionInvoices,
  upgradeSubscriptionPlan,
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.use(protect);

// Public / General Subscription Plans List
router.get('/plans', getSubscriptionPlans);

// Tenant Company Admin Subscription Endpoints
router.get('/my-subscription', enforceTenant, getCompanySubscriptionDetails);
router.get('/invoices', enforceTenant, getSubscriptionInvoices);
router.post('/upgrade', enforceTenant, upgradeSubscriptionPlan);

// Super Admin Platform & Per-Tenant Subscription Endpoints
router.post('/plans', authorizeRoles('Super Admin'), createSubscriptionPlan);
router.patch('/plans/:planId/toggle', authorizeRoles('Super Admin'), togglePlanStatus);
router.get('/tenants', authorizeRoles('Super Admin'), getAllTenantSubscriptions);
router.post('/tenants/onboard', authorizeRoles('Super Admin'), onboardTenantCompany);
router.put('/tenants/:companyId', authorizeRoles('Super Admin'), updateCompanySubscription);
router.patch('/tenants/:companyId/status', authorizeRoles('Super Admin'), toggleTenantCompanyStatus);
router.post('/tenants/:companyId/renew', authorizeRoles('Super Admin'), renewTenantSubscription);
router.delete('/tenants/:companyId', authorizeRoles('Super Admin'), deleteTenantCompany);

export default router;
