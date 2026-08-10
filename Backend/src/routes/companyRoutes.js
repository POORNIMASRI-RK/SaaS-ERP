import express from 'express';
import {
  getCompanies,
  createCompany,
  updateCompany,
  toggleCompanyStatus,
  deleteCompany,
  getCompanyStats,
} from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getCompanyStats);
router.get('/', authorizeRoles('Super Admin', 'Company Admin'), getCompanies);
router.post('/', authorizeRoles('Super Admin'), createCompany);
router.put('/:id', authorizeRoles('Super Admin'), updateCompany);
router.patch('/:id/status', authorizeRoles('Super Admin'), toggleCompanyStatus);
router.delete('/:id', authorizeRoles('Super Admin'), deleteCompany);

export default router;
