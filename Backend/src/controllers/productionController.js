import BOM from '../models/BOM.js';
import ProductionOrder from '../models/ProductionOrder.js';
import Item from '../models/Item.js';
import StockTransaction from '../models/StockTransaction.js';
import Warehouse from '../models/Warehouse.js';

// ==========================================
// 1. BILL OF MATERIALS (BOM)
// ==========================================

export const getBOMs = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const boms = await BOM.find({ tenantId })
      .populate('finishedItemId', 'name itemCode uom unitPrice')
      .populate('components.rawItemId', 'name itemCode uom unitPrice')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: boms.length, boms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveBOM = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id, finishedItemId, finishedQty, components } = req.body;

    if (!finishedItemId || !components || components.length === 0) {
      return res.status(400).json({ success: false, message: 'Finished Item and Components are required.' });
    }

    let estimatedMaterialCost = 0;
    for (const comp of components) {
      const rawItem = await Item.findById(comp.rawItemId);
      if (rawItem) {
        estimatedMaterialCost += (comp.quantityRequired || 1) * rawItem.unitPrice * (1 + (comp.wastagePercent || 0) / 100);
      }
    }

    const bomNumber = `BOM-${Date.now().toString().slice(-6)}`;

    let bom;
    if (id) {
      bom = await BOM.findById(id);
      if (bom) {
        bom.finishedItemId = finishedItemId;
        bom.finishedQty = finishedQty || 1;
        bom.components = components;
        bom.estimatedMaterialCost = estimatedMaterialCost;
        await bom.save();
      }
    } else {
      bom = await BOM.create({
        tenantId,
        bomNumber,
        finishedItemId,
        finishedQty: finishedQty || 1,
        components,
        estimatedMaterialCost,
      });
    }

    res.status(200).json({ success: true, message: 'BOM saved successfully', bom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. PRODUCTION ORDERS & WORK ORDERS
// ==========================================

export const getProductionOrders = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const orders = await ProductionOrder.find({ tenantId })
      .populate('bomId', 'bomNumber')
      .populate('finishedItemId', 'name itemCode uom unitPrice')
      .populate('assignedMachines', 'name machineCode status')
      .populate('assignedEmployees', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProductionOrder = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { bomId, finishedItemId, plannedQty, startDate, dueDate, assignedMachines, assignedEmployees } = req.body;

    if (!bomId || !finishedItemId || !plannedQty) {
      return res.status(400).json({ success: false, message: 'BOM, Finished Item, and Planned Quantity are required.' });
    }

    const bom = await BOM.findById(bomId).populate('components.rawItemId');
    if (!bom) {
      return res.status(404).json({ success: false, message: 'BOM not found.' });
    }

    const orderNumber = `WO-${Date.now().toString().slice(-6)}`;
    const totalMaterialCost = bom.estimatedMaterialCost * plannedQty;

    const productionOrder = await ProductionOrder.create({
      tenantId,
      orderNumber,
      bomId,
      finishedItemId,
      plannedQty: Number(plannedQty),
      startDate: startDate || new Date(),
      dueDate: dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assignedMachines: assignedMachines || [],
      assignedEmployees: assignedEmployees || [],
      status: 'scheduled',
      costCalculation: {
        materialCost: totalMaterialCost,
        overheadCost: totalMaterialCost * 0.15, // 15% labor/overhead
        totalProductionCost: totalMaterialCost * 1.15,
      },
    });

    res.status(201).json({ success: true, message: `Production Order ${orderNumber} created!`, productionOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductionStatus = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const { status, producedQty, scrapQty, warehouseId } = req.body; // status: 'in_progress' | 'completed'

    const po = await ProductionOrder.findById(id).populate('bomId');
    if (!po) {
      return res.status(404).json({ success: false, message: 'Production Order not found.' });
    }

    const targetWarehouse = warehouseId || (await Warehouse.findOne({ tenantId }))?._id;

    // 1. If starting production ('in_progress') and materials not yet deducted: Deduct raw materials from inventory!
    if (status === 'in_progress' && !po.materialsDeducted) {
      const bom = await BOM.findById(po.bomId).populate('components.rawItemId');
      if (bom) {
        for (const comp of bom.components) {
          const rawItem = await Item.findById(comp.rawItemId);
          if (rawItem) {
            const qtyNeeded = comp.quantityRequired * po.plannedQty * (1 + (comp.wastagePercent || 0) / 100);
            rawItem.totalStock = Math.max(0, rawItem.totalStock - qtyNeeded);
            await rawItem.save();

            if (targetWarehouse) {
              await StockTransaction.create({
                tenantId,
                transactionType: 'Production Issue',
                itemId: rawItem._id,
                warehouseId: targetWarehouse,
                quantity: qtyNeeded,
                performedBy: req.user.id,
                referenceNo: po.orderNumber,
                notes: `Raw material issued for Production Order ${po.orderNumber}`,
              });
            }
          }
        }
        po.materialsDeducted = true;
      }
    }

    // 2. If completing production ('completed'): Increase finished goods inventory!
    if (status === 'completed') {
      const actualProduced = Number(producedQty || po.plannedQty);
      const fgItem = await Item.findById(po.finishedItemId);
      if (fgItem) {
        fgItem.totalStock += actualProduced;
        await fgItem.save();

        if (targetWarehouse) {
          await StockTransaction.create({
            tenantId,
            transactionType: 'Production Output',
            itemId: fgItem._id,
            warehouseId: targetWarehouse,
            quantity: actualProduced,
            performedBy: req.user.id,
            referenceNo: po.orderNumber,
            notes: `Finished goods output from Work Order ${po.orderNumber}`,
          });
        }
      }
      po.producedQty = actualProduced;
      po.scrapQty = Number(scrapQty || 0);
    }

    po.status = status;
    await po.save();

    res.status(200).json({
      success: true,
      message: `Production Order ${po.orderNumber} updated to ${status.toUpperCase()}! Stock synced.`,
      productionOrder: po,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
