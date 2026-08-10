import Item from '../models/Item.js';
import Warehouse from '../models/Warehouse.js';
import StockTransaction from '../models/StockTransaction.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get Inventory Items with search, filters & pagination
// @route   GET /api/manufacturing/inventory/items
// @access  Private
export const getItems = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const { search, itemType, category, status } = req.query;

    let query = { tenantId };
    if (itemType) query.itemType = itemType;
    if (category) query.category = category;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    let items = await Item.find(query).sort({ createdAt: -1 });

    if (items.length === 0 && !search && !itemType && !category) {
      const seedItems = [
        {
          tenantId,
          itemCode: 'ITEM-STEEL-001',
          name: 'Steel Sheet Metal Roll (Grade 304)',
          category: 'Raw Material',
          itemGroup: 'Metals',
          itemType: 'Raw Material',
          uom: 'Kg',
          minStockLevel: 50,
          reorderLevel: 100,
          reorderQty: 250,
          unitPrice: 180,
          totalStock: 500,
          valuationMethod: 'FIFO',
          status: 'Active',
        },
        {
          tenantId,
          itemCode: 'ITEM-SHAFT-002',
          name: 'Automotive Drive Shaft Assembly',
          category: 'Finished Goods',
          itemGroup: 'Auto Components',
          itemType: 'Finished Good',
          uom: 'Pcs',
          minStockLevel: 10,
          reorderLevel: 25,
          reorderQty: 50,
          unitPrice: 4200,
          totalStock: 80,
          valuationMethod: 'Weighted Average',
          status: 'Active',
        },
        {
          tenantId,
          itemCode: 'ITEM-HYD-003',
          name: 'Precision Hydraulic Cylinder 50mm',
          category: 'Finished Goods',
          itemGroup: 'Hydraulics',
          itemType: 'Finished Good',
          uom: 'Pcs',
          minStockLevel: 5,
          reorderLevel: 15,
          reorderQty: 30,
          unitPrice: 8500,
          totalStock: 35,
          valuationMethod: 'Weighted Average',
          status: 'Active',
        },
        {
          tenantId,
          itemCode: 'ITEM-ALUM-004',
          name: 'CNC Machined Aluminum Housing',
          category: 'Work in Progress',
          itemGroup: 'Machined Parts',
          itemType: 'Work in Progress',
          uom: 'Pcs',
          minStockLevel: 20,
          reorderLevel: 40,
          reorderQty: 100,
          unitPrice: 1450,
          totalStock: 120,
          valuationMethod: 'FIFO',
          status: 'Active',
        },
        {
          tenantId,
          itemCode: 'ITEM-WIRE-005',
          name: 'Copper Electrical Wire Spool 100m',
          category: 'Raw Material',
          itemGroup: 'Electricals',
          itemType: 'Raw Material',
          uom: 'Roll',
          minStockLevel: 15,
          reorderLevel: 30,
          reorderQty: 60,
          unitPrice: 3200,
          totalStock: 45,
          valuationMethod: 'FIFO',
          status: 'Active',
        },
      ];

      await Item.insertMany(seedItems);
      items = await Item.find(query).sort({ createdAt: -1 });
    }

    const totalValuation = items.reduce((sum, item) => sum + item.totalStock * item.unitPrice, 0);
    const lowStockCount = items.filter((item) => item.totalStock <= item.reorderLevel).length;

    res.status(200).json({
      success: true,
      count: items.length,
      totalValuation,
      lowStockCount,
      items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or Update Item Master
// @route   POST /api/manufacturing/inventory/items
// @access  Private (Company Admin, Inventory Manager, Warehouse Manager, Purchase Manager)
export const saveItem = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.body.tenantId || req.tenantId : req.user.tenantId;
    const {
      id,
      itemCode,
      name,
      category,
      itemGroup,
      itemType,
      uom,
      minStockLevel,
      reorderLevel,
      reorderQty,
      unitPrice,
      valuationMethod,
      totalStock,
    } = req.body;

    if (!itemCode || !name || !itemType) {
      return res.status(400).json({ success: false, message: 'Item Code, Name, and Item Type are required.' });
    }

    const generatedBarcode = `BAR-${itemCode}-${Date.now().toString().slice(-4)}`;
    const generatedQR = `QR-${tenantId}-${itemCode}`;

    let item;
    if (id) {
      item = await Item.findById(id);
      if (item) {
        item.itemCode = itemCode;
        item.name = name;
        item.category = category || item.category;
        item.itemGroup = itemGroup || item.itemGroup;
        item.itemType = itemType;
        item.uom = uom || item.uom;
        item.minStockLevel = minStockLevel !== undefined ? minStockLevel : item.minStockLevel;
        item.reorderLevel = reorderLevel !== undefined ? reorderLevel : item.reorderLevel;
        item.reorderQty = reorderQty !== undefined ? reorderQty : item.reorderQty;
        item.unitPrice = unitPrice !== undefined ? unitPrice : item.unitPrice;
        item.valuationMethod = valuationMethod || item.valuationMethod;
        if (totalStock !== undefined) item.totalStock = totalStock;
        await item.save();
      }
    } else {
      item = await Item.create({
        tenantId,
        itemCode,
        name,
        category: category || 'General',
        itemGroup: itemGroup || 'Default',
        itemType,
        uom: uom || 'Pcs',
        barcode: generatedBarcode,
        qrCode: generatedQR,
        minStockLevel: minStockLevel || 10,
        reorderLevel: reorderLevel || 25,
        reorderQty: reorderQty || 100,
        unitPrice: unitPrice || 0,
        valuationMethod: valuationMethod || 'FIFO',
        totalStock: totalStock || 0,
      });
    }

    res.status(200).json({ success: true, message: 'Item saved successfully', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Perform Stock Transaction (Stock In, Stock Out, Adjustment, Transfer)
// @route   POST /api/manufacturing/inventory/transactions
// @access  Private
export const recordTransaction = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const {
      transactionType,
      itemId,
      warehouseId,
      targetWarehouseId,
      quantity,
      batchNo,
      expiryDate,
      unitCost,
      notes,
    } = req.body;

    if (!transactionType || !itemId || !warehouseId || !quantity) {
      return res.status(400).json({ success: false, message: 'Transaction Type, Item, Warehouse, and Quantity are required.' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const qtyNum = Number(quantity);

    if (transactionType === 'Stock Out' || transactionType === 'Production Issue') {
      if (item.totalStock < qtyNum) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}. Available: ${item.totalStock} ${item.uom}` });
      }
      item.totalStock -= qtyNum;
    } else if (transactionType === 'Stock In' || transactionType === 'GRN' || transactionType === 'Production Output') {
      item.totalStock += qtyNum;
    } else if (transactionType === 'Adjustment') {
      item.totalStock = qtyNum;
    }

    await item.save();

    const transaction = await StockTransaction.create({
      tenantId,
      transactionType,
      itemId,
      warehouseId,
      targetWarehouseId: targetWarehouseId || null,
      quantity: qtyNum,
      batchNo: batchNo || `LOT-${Date.now().toString().slice(-6)}`,
      expiryDate: expiryDate || null,
      unitCost: unitCost || item.unitPrice,
      totalValue: qtyNum * (unitCost || item.unitPrice),
      performedBy: req.user.id,
      notes: notes || '',
    });

    // Check low stock alert
    if (item.totalStock <= item.reorderLevel) {
      const managers = await User.find({
        tenantId,
        role: { $in: ['Company Admin', 'Inventory Manager', 'Warehouse Manager', 'Purchase Manager'] },
      }).select('_id');

      for (const mgr of managers) {
        await Notification.create({
          tenantId,
          recipientId: mgr._id,
          title: `[LOW STOCK ALERT] ${item.name}`,
          message: `Stock level for ${item.name} (${item.itemCode}) has dropped to ${item.totalStock} ${item.uom} (Reorder Level: ${item.reorderLevel}). Reorder recommended!`,
          type: 'inventory_alert',
          link: '/manufacturing/inventory',
        });
      }
    }

    res.status(201).json({ success: true, message: 'Stock transaction recorded successfully', transaction, currentStock: item.totalStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
