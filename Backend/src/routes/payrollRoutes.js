import express from 'express';
import {
  getPayrollConfig,
  updatePayrollConfig,
  getSalaryStructures,
  saveSalaryStructure,
  getEmployeeSalaries,
  assignEmployeeSalary,
  generatePayrollBatch,
  getPayrollBatches,
  getBatchRecords,
  adjustPayrollRecord,
  approvePayrollBatch,
  disbursePayrollBatch,
  getMyPayslips,
  getLoans,
  applyLoan,
  updateLoanStatus,
  getReimbursements,
  applyReimbursement,
  updateReimbursementStatus,
} from '../controllers/payrollController.js';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

// Employee Self-Service Payslips (Every logged-in user can view ONLY their own payslips)
router.get('/my-payslips', getMyPayslips);

// Personal / Assigned Salaries (Admin/HR gets all employees; other roles get ONLY their own)
router.get('/salaries', getEmployeeSalaries);

// Config & Structures (Admin, HR & Finance)
router.get('/config', authorizeRoles('Super Admin', 'Company Admin', 'HR', 'HR Manager', 'Finance', 'Finance Manager', 'Finance Controller', 'Finance Manger'), getPayrollConfig);
router.put('/config', authorizeRoles('Company Admin', 'Super Admin', 'HR', 'HR Manager'), updatePayrollConfig);
router.get('/structures', authorizeRoles('Super Admin', 'Company Admin', 'HR', 'HR Manager', 'Finance', 'Finance Manager', 'Finance Controller', 'Finance Manger'), getSalaryStructures);
router.post('/structures', authorizeRoles('Company Admin', 'HR', 'HR Manager'), saveSalaryStructure);
router.post('/salaries/assign', authorizeRoles('Company Admin', 'HR', 'HR Manager'), assignEmployeeSalary);

// Payroll 3-Step Pipeline: HR Process -> Company Admin Approve -> Finance Disburse & Pay
router.get('/batches', authorizeRoles('Super Admin', 'Company Admin', 'HR', 'HR Manager', 'Finance', 'Finance Manager', 'Finance Controller', 'Finance Manger'), getPayrollBatches);
router.post('/batches/generate', authorizeRoles('Company Admin', 'HR', 'HR Manager'), generatePayrollBatch);
router.get('/batches/:batchId/records', getBatchRecords);
router.patch('/records/:id/adjust', authorizeRoles('Company Admin', 'HR', 'HR Manager'), adjustPayrollRecord);
router.patch('/batches/:batchId/approve', authorizeRoles('Super Admin', 'Company Admin', 'HR', 'HR Manager'), approvePayrollBatch);
router.patch('/batches/:batchId/disburse', authorizeRoles('Super Admin', 'Company Admin', 'Finance', 'Finance Manager', 'Finance Controller', 'Finance Manger'), disbursePayrollBatch);

// Loans & Advances
router.get('/loans', getLoans);
router.post('/loans', applyLoan);
router.patch('/loans/:id/status', authorizeRoles('Company Admin', 'HR', 'HR Manager', 'Finance', 'Finance Manager', 'Finance Controller', 'Finance Manger'), updateLoanStatus);

// Reimbursement Claims
router.get('/reimbursements', getReimbursements);
router.post('/reimbursements', applyReimbursement);
router.patch('/reimbursements/:id/status', authorizeRoles('Company Admin', 'HR', 'HR Manager', 'Finance', 'Finance Manager', 'Finance Controller', 'Finance Manger'), updateReimbursementStatus);

export default router;
