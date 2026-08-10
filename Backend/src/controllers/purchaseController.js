import PurchaseRequest from '../models/PurchaseRequest.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import GRN from '../models/GRN.js';
import Item from '../models/Item.js';
import StockTransaction from '../models/StockTransaction.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ==========================================
// 1. PURCHASE REQUISITIONS (PR)
// ==========================================

export const getPurchaseRequests = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const prs = await PurchaseRequest.find({ tenantId })
      .populate('requestedBy', 'name email role department')
      .populate('approvedBy', 'name')
      .populate('items.itemId', 'name itemCode uom unitPrice')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: prs.length, prs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPurchaseRequest = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { items, department } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required for Purchase Request.' });
    }

    let totalEstimatedCost = 0;
    for (const item of items) {
      totalEstimatedCost += (item.requestedQty || 1) * (item.estimatedUnitPrice || 0);
    }

    const prNumber = `PR-${Date.now().toString().slice(-6)}`;

    const pr = await PurchaseRequest.create({
      tenantId,
      prNumber,
      requestedBy: req.user.id,
      department: department || req.user.department || 'Production',
      items,
      totalEstimatedCost,
      status: 'pending_approval',
    });

    // Notify Managers & Purchase Managers
    const approvers = await User.find({
      tenantId,
      role: { $in: ['Company Admin', 'Purchase Manager', 'Manager'] },
      _id: { $ne: req.user.id },
    }).select('_id');

    for (const appUser of approvers) {
      await Notification.create({
        tenantId,
        recipientId: appUser._id,
        title: `[PR Pending Approval] ${prNumber}`,
        message: `${req.user.name} submitted Purchase Request ${prNumber} for ${items.length} item(s) (Est: ₹${totalEstimatedCost}).`,
        type: 'pr_approval',
        link: '/manufacturing/purchase',
      });
    }

    res.status(201).json({ success: true, message: 'Purchase Request created successfully!', pr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approvePurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

    const pr = await PurchaseRequest.findById(id).populate('requestedBy');
    if (!pr) {
      return res.status(404).json({ success: false, message: 'Purchase Request not found.' });
    }

    if (action === 'reject') {
      pr.status = 'rejected';
      pr.rejectionReason = rejectionReason || 'Operational reason';
    } else {
      pr.status = 'approved';
      pr.approvedBy = req.user.id;
    }

    await pr.save();

    // Notify requester
    await Notification.create({
      tenantId: pr.tenantId,
      recipientId: pr.requestedBy._id,
      title: `PR ${pr.prNumber} ${action === 'reject' ? 'REJECTED' : 'APPROVED'}`,
      message: `Your Purchase Request ${pr.prNumber} was ${action === 'reject' ? 'rejected' : 'approved by ' + req.user.name}.`,
      type: 'pr_status',
      link: '/manufacturing/purchase',
    });

    res.status(200).json({ success: true, message: `Purchase Request ${pr.status}`, pr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. PURCHASE ORDERS (PO)
// ==========================================

export const getPurchaseOrders = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const pos = await PurchaseOrder.find({ tenantId })
      .populate('vendorId', 'companyName vendorCode email phone gstin')
      .populate('items.itemId', 'name itemCode uom')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: pos.length, pos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { prId, vendorId, items, expectedDeliveryDate } = req.body;

    if (!vendorId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Vendor and Items are required for Purchase Order.' });
    }

    let subTotal = 0;
    let taxTotal = 0;
    const processedItems = items.map((it) => {
      const lineSub = it.quantity * it.unitPrice;
      const lineTax = (lineSub * (it.taxRate || 18)) / 100;
      subTotal += lineSub;
      taxTotal += lineTax;
      return {
        itemId: it.itemId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxRate: it.taxRate || 18,
        totalCost: lineSub + lineTax,
      };
    });

    const grandTotal = subTotal + taxTotal;
    const poNumber = `PO-${Date.now().toString().slice(-6)}`;

    const po = await PurchaseOrder.create({
      tenantId,
      poNumber,
      prId: prId || null,
      vendorId,
      items: processedItems,
      subTotal,
      taxTotal,
      grandTotal,
      expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'issued',
      createdBy: req.user.id,
    });

    if (prId) {
      await PurchaseRequest.findByIdAndUpdate(prId, { status: 'po_generated' });
    }

    res.status(201).json({ success: true, message: 'Purchase Order generated and issued to vendor!', po });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. GOODS RECEIVED NOTE (GRN) & QC INSPECTION
// ==========================================

export const getGRNs = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const grns = await GRN.find({ tenantId })
      .populate('poId', 'poNumber')
      .populate('vendorId', 'companyName vendorCode')
      .populate('warehouseId', 'name code')
      .populate('inspectedBy', 'name')
      .populate('receivedItems.itemId', 'name itemCode uom')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: grns.length, grns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGRNAndQC = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { poId, vendorId, warehouseId, receivedItems, qcNotes } = req.body;

    if (!poId || !warehouseId || !receivedItems || receivedItems.length === 0) {
      return res.status(400).json({ success: false, message: 'PO, Warehouse, and Received Items are required.' });
    }

    const grnNumber = `GRN-${Date.now().toString().slice(-6)}`;

    let allPassed = true;
    let anyPassed = false;

    const processedItems = [];
    for (const item of receivedItems) {
      const accepted = Number(item.qtyAccepted || 0);
      const rejected = Number(item.qtyRejected || 0);

      if (rejected > 0) allPassed = false;
      if (accepted > 0) anyPassed = true;

      processedItems.push({
        itemId: item.itemId,
        qtyReceived: Number(item.qtyReceived || accepted + rejected),
        qtyAccepted: accepted,
        qtyRejected: rejected,
        batchNo: item.batchNo || `BATCH-${Date.now().toString().slice(-4)}`,
        expiryDate: item.expiryDate || null,
        rejectionReason: item.rejectionReason || '',
      });

      if (accepted > 0) {
        const itemDoc = await Item.findById(item.itemId);
        if (itemDoc) {
          itemDoc.totalStock += accepted;
          await itemDoc.save();

          await StockTransaction.create({
            tenantId,
            transactionType: 'GRN',
            itemId: item.itemId,
            warehouseId,
            quantity: accepted,
            batchNo: item.batchNo || `BATCH-${Date.now().toString().slice(-4)}`,
            unitCost: itemDoc.unitPrice,
            totalValue: accepted * itemDoc.unitPrice,
            referenceNo: grnNumber,
            performedBy: req.user.id,
            notes: `GRN Receipt for PO ${poId}`,
          });
        }
      }
    }

    const qualityStatus = allPassed ? 'passed' : anyPassed ? 'partially_passed' : 'failed';

    const grn = await GRN.create({
      tenantId,
      grnNumber,
      poId,
      vendorId,
      warehouseId,
      receivedItems: processedItems,
      qualityStatus,
      inspectedBy: req.user.id,
      qcNotes: qcNotes || 'Quality inspection completed.',
    });

    await PurchaseOrder.findByIdAndUpdate(poId, { status: 'received' });

    res.status(201).json({
      success: true,
      message: `GRN ${grnNumber} generated! Quality Check status: ${qualityStatus.toUpperCase()}. Stock updated!`,
      grn,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. VENDOR INVOICE VERIFICATION & PAYMENT PROCESSING (FINANCE)
// ==========================================

export const recordVendorPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentRef, notes } = req.body;

    const po = await PurchaseOrder.findById(id).populate('vendorId');
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found.' });
    }

    po.status = 'paid';
    await po.save();

    await Notification.create({
      tenantId: po.tenantId,
      recipientId: po.createdBy,
      title: `[Vendor Payment Verified] PO ${po.poNumber}`,
      message: `Finance verified invoice & disbursed payment of ₹${po.grandTotal?.toLocaleString('en-IN')} for ${po.vendorId?.companyName || 'Vendor'} (Ref: ${paymentRef || 'TXN-FIN-001'}).`,
      type: 'po_payment',
      link: '/manufacturing/purchase',
    });

    res.status(200).json({
      success: true,
      message: `Finance verified invoice and recorded vendor payment of ₹${po.grandTotal?.toLocaleString('en-IN')} for PO ${po.poNumber}!`,
      po,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
