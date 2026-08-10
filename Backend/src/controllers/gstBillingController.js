import Customer from '../models/Customer.js';
import GSTInvoice from '../models/GSTInvoice.js';
import CreditNote from '../models/CreditNote.js';
import DebitNote from '../models/DebitNote.js';
import GSTSettings from '../models/GSTSettings.js';
import Item from '../models/Item.js';
import StockTransaction from '../models/StockTransaction.js';
import Warehouse from '../models/Warehouse.js';
import Notification from '../models/Notification.js';

// ==========================================
// 1. CUSTOMER MASTER (CRM INTEGRATION)
// ==========================================

export const getCustomers = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    let customers = await Customer.find({ tenantId }).sort({ createdAt: -1 });

    if (customers.length === 0) {
      // Seed default customers for the company
      const defaultCust1 = await Customer.create({
        tenantId,
        customerCode: 'CUST-001',
        companyName: 'Apex Tooling & Heavy Auto Corp',
        contactPerson: 'Vikram Sundaram',
        email: 'billing@apextooling.in',
        phone: '+91 98450 12345',
        gstin: '33AAACA9999A1Z5',
        pan: 'AAACA9999A',
        billingAddress: { street: '12 Industrial Estate, Guindy', city: 'Chennai', state: 'Tamil Nadu', stateCode: '33', zipCode: '600032' },
        creditLimit: 1000000,
        status: 'active',
      });

      const defaultCust2 = await Customer.create({
        tenantId,
        customerCode: 'CUST-002',
        companyName: 'Mumbai Heavy Drivetrains Pvt Ltd',
        contactPerson: 'Rajesh Kulkarni',
        email: 'accounts@mumbaidrivetrains.in',
        phone: '+91 98200 54321',
        gstin: '27AAACB8888A1Z2',
        pan: 'AAACB8888A',
        billingAddress: { street: '45 MIDC Zone 2, Andheri East', city: 'Mumbai', state: 'Maharashtra', stateCode: '27', zipCode: '400093' },
        creditLimit: 1500000,
        status: 'active',
      });
      customers = [defaultCust1, defaultCust2];
    }

    res.status(200).json({ success: true, count: customers.length, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { companyName, contactPerson, email, phone, gstin, pan, billingAddress } = req.body;

    if (!companyName || !contactPerson || !email || !phone || !billingAddress?.state) {
      return res.status(400).json({ success: false, message: 'Company Name, Contact Person, Email, Phone, and Billing State are required.' });
    }

    const count = await Customer.countDocuments({ tenantId });
    const customerCode = `CUST-${(count + 1).toString().padStart(3, '0')}`;

    const customer = await Customer.create({
      tenantId,
      customerCode,
      companyName,
      contactPerson,
      email,
      phone,
      gstin: gstin ? gstin.toUpperCase() : '',
      pan: pan ? pan.toUpperCase() : '',
      billingAddress,
    });

    res.status(201).json({ success: true, message: 'Customer registered successfully!', customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. GST INVOICING & AUTOMATED TAX CALCULATIONS
// ==========================================

export const getInvoices = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    let invoices = await GSTInvoice.find({ tenantId })
      .populate('customerId', 'companyName customerCode email phone gstin billingAddress')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    if (invoices.length === 0) {
      // Auto-seed Customers first
      let cust1 = await Customer.findOne({ tenantId, customerCode: 'CUST-001' });
      if (!cust1) {
        cust1 = await Customer.create({
          tenantId,
          customerCode: 'CUST-001',
          companyName: 'Apex Tooling & Heavy Auto Corp',
          contactPerson: 'Vikram Sundaram',
          email: 'billing@apextooling.in',
          phone: '+91 98450 12345',
          gstin: '33AAACA9999A1Z5',
          pan: 'AAACA9999A',
          billingAddress: { street: '12 Industrial Estate, Guindy', city: 'Chennai', state: 'Tamil Nadu', stateCode: '33', zipCode: '600032' },
          creditLimit: 1000000,
          status: 'active',
        });
      }

      let cust2 = await Customer.findOne({ tenantId, customerCode: 'CUST-002' });
      if (!cust2) {
        cust2 = await Customer.create({
          tenantId,
          customerCode: 'CUST-002',
          companyName: 'Mumbai Heavy Drivetrains Pvt Ltd',
          contactPerson: 'Rajesh Kulkarni',
          email: 'accounts@mumbaidrivetrains.in',
          phone: '+91 98200 54321',
          gstin: '27AAACB8888A1Z2',
          pan: 'AAACB8888A',
          billingAddress: { street: '45 MIDC Zone 2, Andheri East', city: 'Mumbai', state: 'Maharashtra', stateCode: '27', zipCode: '400093' },
          creditLimit: 1500000,
          status: 'active',
        });
      }

      // Find an item or create a placeholder item
      let itemDoc = await Item.findOne({ tenantId });
      if (!itemDoc) {
        itemDoc = await Item.create({
          tenantId,
          itemCode: 'FG-SHF-900',
          name: 'Heavy Duty Automotive Transmission Drive Shaft',
          category: 'Drivetrain Components',
          itemGroup: 'Finished Goods',
          itemType: 'Finished Goods',
          uom: 'Pcs',
          unitPrice: 420,
          totalStock: 60,
        });
      }

      // Create Sample Invoices
      const inv1 = await GSTInvoice.create({
        tenantId,
        invoiceNumber: 'INV-2026-1001',
        invoiceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
        customerId: cust1._id,
        sellerState: 'Tamil Nadu',
        placeOfSupply: 'Tamil Nadu',
        isInterState: false,
        items: [
          {
            itemId: itemDoc._id,
            name: itemDoc.name,
            itemCode: itemDoc.itemCode,
            hsnCode: '8471',
            uom: 'Pcs',
            qty: 10,
            unitPrice: 420,
            discountPercent: 0,
            taxableAmount: 4200,
            gstRate: 18,
            cgstRate: 9,
            cgstAmount: 378,
            sgstRate: 9,
            sgstAmount: 378,
            igstRate: 0,
            igstAmount: 0,
            totalAmount: 4956,
          },
        ],
        subTotal: 4200,
        totalDiscount: 0,
        totalTaxableAmount: 4200,
        cgstTotal: 378,
        sgstTotal: 378,
        igstTotal: 0,
        totalTaxAmount: 756,
        grandTotal: 4956,
        paidAmount: 4956,
        balanceDue: 0,
        paymentStatus: 'paid',
        notes: 'Invoice settled in full via NEFT.',
        createdBy: req.user.id,
      });

      const inv2 = await GSTInvoice.create({
        tenantId,
        invoiceNumber: 'INV-2026-1002',
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        customerId: cust2._id,
        sellerState: 'Tamil Nadu',
        placeOfSupply: 'Maharashtra',
        isInterState: true,
        items: [
          {
            itemId: itemDoc._id,
            name: itemDoc.name,
            itemCode: itemDoc.itemCode,
            hsnCode: '8471',
            uom: 'Pcs',
            qty: 25,
            unitPrice: 420,
            discountPercent: 5,
            taxableAmount: 9975,
            gstRate: 18,
            cgstRate: 0,
            cgstAmount: 0,
            sgstRate: 0,
            sgstAmount: 0,
            igstRate: 18,
            igstAmount: 1795.5,
            totalAmount: 11770.5,
          },
        ],
        subTotal: 10500,
        totalDiscount: 525,
        totalTaxableAmount: 9975,
        cgstTotal: 0,
        sgstTotal: 0,
        igstTotal: 1796,
        totalTaxAmount: 1796,
        grandTotal: 11771,
        paidAmount: 0,
        balanceDue: 11771,
        paymentStatus: 'pending',
        notes: 'Inter-state IGST B2B invoice.',
        createdBy: req.user.id,
      });

      // Sample Credit & Debit Notes
      await CreditNote.create({
        tenantId,
        creditNoteNumber: 'CN-2026-101',
        invoiceId: inv1._id,
        customerId: cust1._id,
        reason: 'Damaged Goods',
        subTotalRefund: 420,
        gstRefundTotal: 76,
        totalRefundAmount: 496,
        status: 'refunded',
        createdBy: req.user.id,
      });

      await DebitNote.create({
        tenantId,
        debitNoteNumber: 'DN-2026-101',
        invoiceId: inv2._id,
        customerId: cust2._id,
        reason: 'Additional Freight Charges',
        additionalAmount: 1500,
        gstAdditional: 270,
        totalDebitAmount: 1770,
        status: 'issued',
        createdBy: req.user.id,
      });

      invoices = await GSTInvoice.find({ tenantId })
        .populate('customerId', 'companyName customerCode email phone gstin billingAddress')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    }

    // Compute Dashboard Metrics
    let totalInvoices = invoices.length;
    let paidInvoices = invoices.filter((i) => i.paymentStatus === 'paid').length;
    let pendingInvoices = invoices.filter((i) => i.paymentStatus === 'pending').length;

    let totalGstCollected = invoices.reduce((sum, i) => sum + (i.paymentStatus !== 'cancelled' ? i.totalTaxAmount : 0), 0);
    let totalSales = invoices.reduce((sum, i) => sum + (i.paymentStatus !== 'cancelled' ? i.grandTotal : 0), 0);
    let totalOutstanding = invoices.reduce((sum, i) => sum + (i.paymentStatus !== 'cancelled' ? i.balanceDue : 0), 0);

    res.status(200).json({
      success: true,
      count: invoices.length,
      metrics: {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        totalGstCollected: Math.round(totalGstCollected),
        totalSales: Math.round(totalSales),
        totalOutstanding: Math.round(totalOutstanding),
      },
      invoices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { customerId, invoiceDate, dueDate, items, notes } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer and line items are required.' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Get Tenant Settings for State Code & Prefix
    let settings = await GSTSettings.findOne({ tenantId });
    if (!settings) {
      settings = await GSTSettings.create({ tenantId, state: 'Tamil Nadu', stateCode: '33' });
    }

    const sellerState = settings.state || 'Tamil Nadu';
    const customerState = customer.billingAddress?.state || 'Tamil Nadu';
    const isInterState = sellerState.trim().toLowerCase() !== customerState.trim().toLowerCase();

    let subTotal = 0;
    let totalDiscount = 0;
    let totalTaxableAmount = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const processedItems = [];

    for (const itemInput of items) {
      const itemDoc = await Item.findById(itemInput.itemId);
      if (!itemDoc) continue;

      const qty = Number(itemInput.qty || 1);
      const unitPrice = Number(itemInput.unitPrice || itemDoc.unitPrice || 0);
      const discountPercent = Number(itemInput.discountPercent || 0);

      const grossLine = qty * unitPrice;
      const discountLine = (grossLine * discountPercent) / 100;
      const taxableLine = grossLine - discountLine;

      const gstRate = Number(itemInput.gstRate || settings.defaultGstRate || 18);

      let cgstRate = 0,
        cgstAmount = 0,
        sgstRate = 0,
        sgstAmount = 0,
        igstRate = 0,
        igstAmount = 0;

      if (isInterState) {
        igstRate = gstRate;
        igstAmount = (taxableLine * igstRate) / 100;
        igstTotal += igstAmount;
      } else {
        cgstRate = gstRate / 2;
        cgstAmount = (taxableLine * cgstRate) / 100;
        sgstRate = gstRate / 2;
        sgstAmount = (taxableLine * sgstRate) / 100;
        cgstTotal += cgstAmount;
        sgstTotal += sgstAmount;
      }

      const totalLine = taxableLine + cgstAmount + sgstAmount + igstAmount;

      subTotal += grossLine;
      totalDiscount += discountLine;
      totalTaxableAmount += taxableLine;

      processedItems.push({
        itemId: itemDoc._id,
        name: itemDoc.name,
        itemCode: itemDoc.itemCode,
        hsnCode: itemInput.hsnCode || '8471',
        uom: itemDoc.uom || 'Pcs',
        qty,
        unitPrice,
        discountPercent,
        taxableAmount: Math.round(taxableLine),
        gstRate,
        cgstRate,
        cgstAmount: Math.round(cgstAmount),
        sgstRate,
        sgstAmount: Math.round(sgstAmount),
        igstRate,
        igstAmount: Math.round(igstAmount),
        totalAmount: Math.round(totalLine),
      });

      // AUTO DEDUCT INVENTORY STOCK & RECORD TRANSACTION
      itemDoc.totalStock = Math.max(0, itemDoc.totalStock - qty);
      await itemDoc.save();

      const defaultWarehouse = await Warehouse.findOne({ tenantId });
      await StockTransaction.create({
        tenantId,
        transactionType: 'Invoice',
        itemId: itemDoc._id,
        warehouseId: defaultWarehouse ? defaultWarehouse._id : undefined,
        quantity: -qty,
        unitCost: unitPrice,
        totalValue: -taxableLine,
        referenceNo: `INV-OUT`,
        performedBy: req.user.id,
        notes: `Sales Invoice Stock Out for ${customer.companyName}`,
      });
    }

    const totalTaxAmount = Math.round(cgstTotal + sgstTotal + igstTotal);
    const grandTotal = Math.round(totalTaxableAmount + totalTaxAmount);

    const count = await GSTInvoice.countDocuments({ tenantId });
    const invoiceNumber = `${settings.invoicePrefix || 'INV-2026-'}${(count + 1001).toString()}`;

    const invoice = await GSTInvoice.create({
      tenantId,
      invoiceNumber,
      invoiceDate: invoiceDate || new Date(),
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      customerId,
      sellerState,
      placeOfSupply: customerState,
      isInterState,
      items: processedItems,
      subTotal: Math.round(subTotal),
      totalDiscount: Math.round(totalDiscount),
      totalTaxableAmount: Math.round(totalTaxableAmount),
      cgstTotal: Math.round(cgstTotal),
      sgstTotal: Math.round(sgstTotal),
      igstTotal: Math.round(igstTotal),
      totalTaxAmount,
      grandTotal,
      paidAmount: 0,
      balanceDue: grandTotal,
      paymentStatus: 'pending',
      notes: notes || 'Thank you for your business!',
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: `GST Invoice ${invoiceNumber} issued successfully! Tax Taxable: ₹${grandTotal.toLocaleString('en-IN')}`,
      invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. PAYMENT RECORDING & INVOICE STATUS
// ==========================================

export const recordInvoicePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid, paymentMethod, paymentRef, notes } = req.body;

    const invoice = await GSTInvoice.findById(id).populate('customerId');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const payVal = Number(amountPaid || 0);
    if (payVal <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    invoice.paidAmount += payVal;
    invoice.balanceDue = Math.max(0, invoice.grandTotal - invoice.paidAmount);

    if (invoice.balanceDue === 0) {
      invoice.paymentStatus = 'paid';
    } else {
      invoice.paymentStatus = 'partially_paid';
    }

    await invoice.save();

    res.status(200).json({
      success: true,
      message: `Payment of ₹${payVal.toLocaleString('en-IN')} recorded for Invoice ${invoice.invoiceNumber}. Remaining Due: ₹${invoice.balanceDue.toLocaleString('en-IN')}`,
      invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await GSTInvoice.findById(id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    invoice.paymentStatus = 'cancelled';
    await invoice.save();

    // Restore Inventory stock for cancelled items
    for (const item of invoice.items) {
      const itemDoc = await Item.findById(item.itemId);
      if (itemDoc) {
        itemDoc.totalStock += item.qty;
        await itemDoc.save();
      }
    }

    res.status(200).json({ success: true, message: `Invoice ${invoice.invoiceNumber} CANCELLED. Inventory stock restored!`, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. CREDIT NOTES & DEBIT NOTES
// ==========================================

export const getCreditNotes = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const creditNotes = await CreditNote.find({ tenantId })
      .populate('invoiceId', 'invoiceNumber')
      .populate('customerId', 'companyName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: creditNotes.length, creditNotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCreditNote = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { invoiceId, reason, totalRefundAmount } = req.body;

    const invoice = await GSTInvoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: 'Reference Invoice not found.' });

    const count = await CreditNote.countDocuments({ tenantId });
    const creditNoteNumber = `CN-2026-${(count + 101).toString()}`;

    const subTotalRefund = Math.round(totalRefundAmount / 1.18);
    const gstRefundTotal = Math.round(totalRefundAmount - subTotalRefund);

    const creditNote = await CreditNote.create({
      tenantId,
      creditNoteNumber,
      invoiceId,
      customerId: invoice.customerId,
      reason: reason || 'Product Return',
      subTotalRefund,
      gstRefundTotal,
      totalRefundAmount,
      status: 'refunded',
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, message: `Credit Note ${creditNoteNumber} issued!`, creditNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDebitNotes = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const debitNotes = await DebitNote.find({ tenantId })
      .populate('invoiceId', 'invoiceNumber')
      .populate('customerId', 'companyName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: debitNotes.length, debitNotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDebitNote = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { invoiceId, reason, totalDebitAmount } = req.body;

    const invoice = await GSTInvoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: 'Reference Invoice not found.' });

    const count = await DebitNote.countDocuments({ tenantId });
    const debitNoteNumber = `DN-2026-${(count + 101).toString()}`;

    const additionalAmount = Math.round(totalDebitAmount / 1.18);
    const gstAdditional = Math.round(totalDebitAmount - additionalAmount);

    const debitNote = await DebitNote.create({
      tenantId,
      debitNoteNumber,
      invoiceId,
      customerId: invoice.customerId,
      reason: reason || 'Price Correction',
      additionalAmount,
      gstAdditional,
      totalDebitAmount,
      status: 'issued',
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, message: `Debit Note ${debitNoteNumber} issued!`, debitNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. GST REPORTS & GSTR-1 / GSTR-3B FILING SUMMARY
// ==========================================

export const getGstReports = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const invoices = await GSTInvoice.find({ tenantId, paymentStatus: { $ne: 'cancelled' } }).populate('customerId');

    const gstr1Sales = invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      customerName: inv.customerId?.companyName,
      customerGstin: inv.customerId?.gstin || 'URP (Unregistered)',
      placeOfSupply: inv.placeOfSupply,
      taxableAmount: inv.totalTaxableAmount,
      cgst: inv.cgstTotal,
      sgst: inv.sgstTotal,
      igst: inv.igstTotal,
      totalTax: inv.totalTaxAmount,
      invoiceValue: inv.grandTotal,
    }));

    const totalCgst = invoices.reduce((s, i) => s + i.cgstTotal, 0);
    const totalSgst = invoices.reduce((s, i) => s + i.sgstTotal, 0);
    const totalIgst = invoices.reduce((s, i) => s + i.igstTotal, 0);
    const totalTaxLiability = totalCgst + totalSgst + totalIgst;

    res.status(200).json({
      success: true,
      summary: {
        totalCgst: Math.round(totalCgst),
        totalSgst: Math.round(totalSgst),
        totalIgst: Math.round(totalIgst),
        totalTaxLiability: Math.round(totalTaxLiability),
        b2bInvoiceCount: invoices.filter((i) => i.customerId?.gstin).length,
      },
      gstr1Sales,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. GST SETTINGS
// ==========================================

export const getGstSettings = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    let settings = await GSTSettings.findOne({ tenantId });

    if (!settings) {
      settings = await GSTSettings.create({
        tenantId,
        gstin: '33AAACA1001A1Z5',
        state: 'Tamil Nadu',
        stateCode: '33',
        invoicePrefix: 'INV-2026-',
      });
    }

    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGstSettings = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    let settings = await GSTSettings.findOne({ tenantId });

    if (!settings) {
      settings = new GSTSettings({ tenantId });
    }

    Object.assign(settings, req.body);
    await settings.save();

    res.status(200).json({ success: true, message: 'GST Settings updated successfully!', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
