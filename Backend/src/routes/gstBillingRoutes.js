import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getCustomers,
  createCustomer,
  getInvoices,
  createInvoice,
  recordInvoicePayment,
  cancelInvoice,
  getCreditNotes,
  createCreditNote,
  getDebitNotes,
  createDebitNote,
  getGstReports,
  getGstSettings,
  updateGstSettings,
} from '../controllers/gstBillingController.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenant);
router.use(authorizeRoles('Super Admin', 'Company Admin', 'Finance'));

// Customers (CRM integration)
router.get('/customers', getCustomers);
router.post('/customers', createCustomer);

// Invoices & Payments
router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);
router.patch('/invoices/:id/pay', recordInvoicePayment);
router.patch('/invoices/:id/cancel', cancelInvoice);

// Credit & Debit Notes
router.get('/credit-notes', getCreditNotes);
router.post('/credit-notes', createCreditNote);
router.get('/debit-notes', getDebitNotes);
router.post('/debit-notes', createDebitNote);

// GST Reports (GSTR-1 & GSTR-3B)
router.get('/reports', getGstReports);

// Settings
router.get('/settings', getGstSettings);
router.put('/settings', updateGstSettings);

export default router;
