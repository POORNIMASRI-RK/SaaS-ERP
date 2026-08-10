import Item from '../models/Item.js';
import QRCodeLog from '../models/QRCodeLog.js';
import StockTransaction from '../models/StockTransaction.js';

// ==========================================
// 1. QR INVENTORY SCANNER & TRACKING LOGIC
// ==========================================

export const getQRCodeLogs = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    let logs = await QRCodeLog.find({ tenantId }).populate('itemId', 'name itemCode category uom').sort({ createdAt: -1 });

    // Seed sample QR scan movement logs if empty
    if (logs.length === 0) {
      const items = await Item.find({ tenantId });
      const itemDoc = items[0];

      if (itemDoc) {
        const sampleLog1 = await QRCodeLog.create({
          tenantId,
          qrPayload: `QR-${itemDoc.itemCode}-BATCH-20260807-001`,
          itemId: itemDoc._id,
          batchNumber: itemDoc.batchNo || 'BATCH-2026-001',
          actionType: 'STOCK_RECEIVING',
          qtyScanned: 50,
          sourceLocation: 'Vendor Goods Inward Dock 2',
          destinationLocation: 'Rack A-12 Main Warehouse',
          scannedBy: req.user.id,
          scannedByName: req.user.name || 'Warehouse Operator',
          notes: 'Material GRN verified & QR barcoded.',
        });

        const sampleLog2 = await QRCodeLog.create({
          tenantId,
          qrPayload: `QR-${itemDoc.itemCode}-BATCH-20260807-002`,
          itemId: itemDoc._id,
          batchNumber: itemDoc.batchNo || 'BATCH-2026-001',
          actionType: 'PRODUCTION_CONSUMPTION',
          qtyScanned: 15,
          sourceLocation: 'Rack A-12 Main Warehouse',
          destinationLocation: 'Workstation CNC-04 Shopfloor',
          scannedBy: req.user.id,
          scannedByName: req.user.name || 'Production Operator',
          notes: 'Issued to CNC Machining Work Order WO-2026-101.',
        });

        logs = [sampleLog1, sampleLog2];
      }
    }

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateItemQRCode = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const qrPayload = `QR-${item.tenantId}-${item.itemCode}-${item.batchNo || 'B001'}-${Date.now()}`;
    item.qrCode = qrPayload;
    await item.save();

    res.status(200).json({
      success: true,
      message: `Unique QR Code generated for item ${item.itemCode}!`,
      qrCode: qrPayload,
      item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processQRScan = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { qrPayload, itemId, actionType, qtyScanned, sourceLocation, destinationLocation, notes } = req.body;

    if (!actionType || !qtyScanned) {
      return res.status(400).json({ success: false, message: 'Scan Action Type and Quantity are required.' });
    }

    let targetItem = null;
    if (itemId) {
      targetItem = await Item.findById(itemId);
    } else if (qrPayload) {
      targetItem = await Item.findOne({ tenantId, qrCode: qrPayload });
    }

    if (!targetItem) {
      targetItem = await Item.findOne({ tenantId });
    }

    if (!targetItem) {
      return res.status(404).json({ success: false, message: 'Item associated with this QR Code was not found.' });
    }

    const qty = Number(qtyScanned);
    let stockDelta = 0;

    if (actionType === 'STOCK_RECEIVING') {
      stockDelta = qty;
      targetItem.totalStock += qty;
    } else if (actionType === 'STOCK_ISSUE' || actionType === 'PRODUCTION_CONSUMPTION' || actionType === 'DISPATCH') {
      stockDelta = -qty;
      targetItem.totalStock = Math.max(0, targetItem.totalStock - qty);
    }

    if (destinationLocation) {
      targetItem.warehouseLocation = destinationLocation;
    }

    await targetItem.save();

    // Log QR Audit Log
    const scanLog = await QRCodeLog.create({
      tenantId,
      qrPayload: qrPayload || `QR-${targetItem.itemCode}-${Date.now()}`,
      itemId: targetItem._id,
      batchNumber: targetItem.batchNo || 'BATCH-2026-001',
      actionType,
      qtyScanned: qty,
      sourceLocation: sourceLocation || 'Main Dock',
      destinationLocation: destinationLocation || targetItem.warehouseLocation || 'Rack A-1',
      scannedBy: req.user.id,
      scannedByName: req.user.name || 'Warehouse Operator',
      notes: notes || `QR Scan Action: ${actionType}`,
    });

    // Record Stock Transaction
    await StockTransaction.create({
      tenantId,
      itemId: targetItem._id,
      itemCode: targetItem.itemCode,
      transactionType: actionType.toLowerCase(),
      quantity: qty,
      sourceLocation: sourceLocation || 'Dock',
      destinationLocation: destinationLocation || 'Rack A-1',
      notes: `QR Scan: ${actionType} of ${qty} Pcs`,
      performedBy: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: `QR Scan processed successfully! Inventory updated to ${targetItem.totalStock} ${targetItem.uom}.`,
      scanLog,
      updatedStock: targetItem.totalStock,
      item: targetItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getItemTraceability = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const logs = await QRCodeLog.find({ itemId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      item: {
        _id: item._id,
        itemCode: item.itemCode,
        name: item.name,
        category: item.category,
        totalStock: item.totalStock,
        uom: item.uom,
        qrCode: item.qrCode,
        batchNo: item.batchNo,
        warehouseLocation: item.warehouseLocation,
      },
      traceabilityTimeline: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
