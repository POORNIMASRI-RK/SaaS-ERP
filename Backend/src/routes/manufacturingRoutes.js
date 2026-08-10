import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

import { getItems, saveItem, recordTransaction } from '../controllers/inventoryController.js';
import { getWarehouses, saveWarehouse } from '../controllers/warehouseController.js';
import { getVendors, saveVendor } from '../controllers/vendorController.js';
import {
  getPurchaseRequests,
  createPurchaseRequest,
  approvePurchaseRequest,
  getPurchaseOrders,
  createPurchaseOrder,
  recordVendorPayment,
  getGRNs,
  createGRNAndQC,
} from '../controllers/purchaseController.js';
import {
  getBOMs,
  saveBOM,
  getProductionOrders,
  createProductionOrder,
  updateProductionStatus,
} from '../controllers/productionController.js';
import {
  getMachines,
  saveMachine,
  getMaintenanceLogs,
  createMaintenanceLog,
  completeMaintenance,
} from '../controllers/machineController.js';

const router = express.Router();

// Apply auth protection to all manufacturing endpoints
router.use(protect);

// 1. Vendor Management
// View Only for Finance: Super Admin, Company Admin, Purchase Manager, Inventory Manager, Finance, Manager
router.get(
  '/vendors',
  authorize('Super Admin', 'Company Admin', 'Purchase Manager', 'Inventory Manager', 'Finance', 'Manager'),
  getVendors
);
// Full Create/Edit: Super Admin, Company Admin, Purchase Manager
router.post(
  '/vendors',
  authorize('Super Admin', 'Company Admin', 'Purchase Manager'),
  saveVendor
);

// 2. Inventory Management
// View Only for Finance: Super Admin, Company Admin, Purchase Manager, Inventory Manager, Warehouse Manager, Production Manager, Maintenance Manager, Finance, Manager, Team Leader
router.get(
  '/inventory/items',
  authorize(
    'Super Admin',
    'Company Admin',
    'Sales Manager',
    'Sales Executive',
    'Sales Employee',
    'CRM Employee',
    'Purchase Manager',
    'Inventory Manager',
    'Warehouse Manager',
    'Production Manager',
    'Maintenance Manager',
    'Finance',
    'Manager',
    'Team Leader'
  ),
  getItems
);
// Full Item Master Create/Edit: Super Admin, Company Admin, Inventory Manager
router.post(
  '/inventory/items',
  authorize('Super Admin', 'Company Admin', 'Inventory Manager'),
  saveItem
);
// Stock Operations (Stock In / Stock Out): Super Admin, Company Admin, Inventory Manager, Warehouse Manager
router.post(
  '/inventory/transactions',
  authorize('Super Admin', 'Company Admin', 'Inventory Manager', 'Warehouse Manager'),
  recordTransaction
);

// 3. Warehouse Management
// View Only for Finance: Super Admin, Company Admin, Purchase Manager, Inventory Manager, Warehouse Manager, Production Manager, Finance, Manager
router.get(
  '/warehouses',
  authorize(
    'Super Admin',
    'Company Admin',
    'Purchase Manager',
    'Inventory Manager',
    'Warehouse Manager',
    'Production Manager',
    'Finance',
    'Manager'
  ),
  getWarehouses
);
// Manage/Full: Super Admin, Company Admin, Warehouse Manager
router.post(
  '/warehouses',
  authorize('Super Admin', 'Company Admin', 'Warehouse Manager'),
  saveWarehouse
);

// 4. Purchase Workflow (View & Payment Processing for Finance)
router.get(
  '/purchase/requests',
  authorize(
    'Super Admin',
    'Company Admin',
    'Purchase Manager',
    'Inventory Manager',
    'Warehouse Manager',
    'Production Manager',
    'Finance'
  ),
  getPurchaseRequests
);
router.post(
  '/purchase/requests',
  authorize('Super Admin', 'Company Admin', 'Purchase Manager', 'Inventory Manager', 'Warehouse Manager', 'Production Manager', 'Manager'),
  createPurchaseRequest
);
router.patch(
  '/purchase/requests/:id/approve',
  authorize('Super Admin', 'Company Admin', 'Purchase Manager', 'Manager'),
  approvePurchaseRequest
);

router.get(
  '/purchase/orders',
  authorize(
    'Super Admin',
    'Company Admin',
    'Purchase Manager',
    'Inventory Manager',
    'Warehouse Manager',
    'Production Manager',
    'Finance'
  ),
  getPurchaseOrders
);
router.post(
  '/purchase/orders',
  authorize('Super Admin', 'Company Admin', 'Purchase Manager'),
  createPurchaseOrder
);
// Finance Vendor Payment Processing
router.patch(
  '/purchase/orders/:id/payment',
  authorize('Super Admin', 'Company Admin', 'Finance'),
  recordVendorPayment
);

router.get(
  '/purchase/grn',
  authorize(
    'Super Admin',
    'Company Admin',
    'Purchase Manager',
    'Inventory Manager',
    'Warehouse Manager',
    'Production Manager',
    'Finance'
  ),
  getGRNs
);
router.post(
  '/purchase/grn',
  authorize('Super Admin', 'Company Admin', 'Purchase Manager', 'Warehouse Manager', 'Inventory Manager'),
  createGRNAndQC
);

// 5. Production Planning & Work Orders (View Only for Finance)
router.get(
  '/production/boms',
  authorize(
    'Super Admin',
    'Company Admin',
    'Purchase Manager',
    'Inventory Manager',
    'Warehouse Manager',
    'Production Manager',
    'Maintenance Manager',
    'Finance',
    'Manager'
  ),
  getBOMs
);
router.post(
  '/production/boms',
  authorize('Super Admin', 'Company Admin', 'Production Manager'),
  saveBOM
);

router.get(
  '/production/orders',
  authorize(
    'Super Admin',
    'Company Admin',
    'Purchase Manager',
    'Inventory Manager',
    'Warehouse Manager',
    'Production Manager',
    'Maintenance Manager',
    'Finance',
    'Manager',
    'Team Leader'
  ),
  getProductionOrders
);
router.post(
  '/production/orders',
  authorize('Super Admin', 'Company Admin', 'Production Manager'),
  createProductionOrder
);
router.patch(
  '/production/orders/:id/status',
  authorize('Super Admin', 'Company Admin', 'Production Manager', 'Team Leader'),
  updateProductionStatus
);

// 6. Machine Maintenance (View Only for Finance)
router.get(
  '/machines',
  authorize(
    'Super Admin',
    'Company Admin',
    'Inventory Manager',
    'Warehouse Manager',
    'Production Manager',
    'Maintenance Manager',
    'Finance',
    'Manager'
  ),
  getMachines
);
router.post(
  '/machines',
  authorize('Super Admin', 'Company Admin', 'Maintenance Manager'),
  saveMachine
);

router.get(
  '/maintenance/logs',
  authorize(
    'Super Admin',
    'Company Admin',
    'Inventory Manager',
    'Warehouse Manager',
    'Production Manager',
    'Maintenance Manager',
    'Finance',
    'Manager'
  ),
  getMaintenanceLogs
);
router.post(
  '/maintenance/logs',
  authorize('Super Admin', 'Company Admin', 'Maintenance Manager', 'Production Manager', 'Team Leader'),
  createMaintenanceLog
);
router.patch(
  '/maintenance/logs/:id/complete',
  authorize('Super Admin', 'Company Admin', 'Maintenance Manager'),
  completeMaintenance
);

export default router;
