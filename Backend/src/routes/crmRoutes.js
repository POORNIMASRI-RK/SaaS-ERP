import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getCrmMetrics,
  getCustomers,
  createCustomer,
  getLeads,
  createLead,
  updateLeadStatus,
  convertLeadToCustomer,
  getOpportunities,
  createOpportunity,
  updateOpportunityStage,
  checkStockForQuotation,
  getQuotations,
  createQuotation,
  updateQuotationStatus,
  convertQuotationToSalesOrder,
  getSalesOrders,
  createSalesOrder,
  updateSalesOrderStatus,
  getFollowUps,
  createFollowUp,
  toggleFollowUpStatus,
  getCrmReports,
} from '../controllers/crmController.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenant);
router.use(
  authorizeRoles(
    'Super Admin',
    'Company Admin',
    'General Manager',
    'Sales Manager',
    'Sales Executive',
    'Sales Employee',
    'CRM Employee',
    'Manager',
    'Production Manager',
    'Warehouse Manager',
    'Warehouse Employee',
    'Finance',
    'Finance Manager',
    'Purchase Manager',
    'Purchase Employee'
  )
);

// Dashboard Metrics
router.get('/metrics', getCrmMetrics);

// Customer Directory
router.get('/customers', getCustomers);
router.post('/customers', createCustomer);

// Leads & Pipeline
router.get('/leads', getLeads);
router.post('/leads', createLead);
router.patch('/leads/:id', updateLeadStatus);
router.patch('/leads/:id/convert', convertLeadToCustomer);

// Sales Opportunities
router.get('/opportunities', getOpportunities);
router.post('/opportunities', createOpportunity);
router.patch('/opportunities/:id/stage', updateOpportunityStage);

// Stock-Aware Quotations Engine
router.post('/quotations/check-stock', checkStockForQuotation);
router.get('/quotations', getQuotations);
router.post('/quotations', createQuotation);
router.patch('/quotations/:id/status', updateQuotationStatus);
router.patch('/quotations/:id/convert', convertQuotationToSalesOrder);

// Sales Orders Engine
router.get('/sales-orders', getSalesOrders);
router.post('/sales-orders', createSalesOrder);
router.patch('/sales-orders/:id/status', updateSalesOrderStatus);

// Follow-ups & Activity Logs
router.get('/followups', getFollowUps);
router.post('/followups', createFollowUp);
router.patch('/followups/:id/toggle', toggleFollowUpStatus);

// Analytics & Sales Performance Reports
router.get('/reports', getCrmReports);

export default router;
