import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getPredictionDashboard,
  getSalesForecast,
  getDemandForecast,
  getProductClassification,
  getAIRecommendations,
  getAISettings,
  updateAISettings,
} from '../controllers/aiPredictionController.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenant);
router.use(
  authorizeRoles(
    'Super Admin',
    'Company Admin',
    'Manager',
    'Production Manager',
    'Purchase Manager',
    'Inventory Manager',
    'Finance'
  )
);

// Overview Dashboard
router.get('/dashboard', getPredictionDashboard);

// Sales Forecast
router.get('/sales-forecast', getSalesForecast);

// Demand Forecast
router.get('/demand-forecast', getDemandForecast);

// Product Classification
router.get('/products-classification', getProductClassification);

// Recommendations
router.get('/recommendations', getAIRecommendations);

// Settings
router.get('/settings', getAISettings);
router.put('/settings', updateAISettings);

export default router;
