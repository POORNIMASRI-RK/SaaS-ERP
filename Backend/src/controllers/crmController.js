import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';
import Opportunity from '../models/Opportunity.js';
import Quotation from '../models/Quotation.js';
import SalesOrder from '../models/SalesOrder.js';
import FollowUp from '../models/FollowUp.js';
import Item from '../models/Item.js';
import Notification from '../models/Notification.js';
import ProductionOrder from '../models/ProductionOrder.js';
import BOM from '../models/BOM.js';
import User from '../models/User.js';

// ==========================================
// 1. CRM OVERVIEW DASHBOARD & 10 METRICS
// ==========================================

export const getCrmMetrics = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    let customers = await Customer.find({ tenantId });
    let leads = await Lead.find({ tenantId });
    let opportunities = await Opportunity.find({ tenantId });
    let quotations = await Quotation.find({ tenantId });
    let orders = await SalesOrder.find({ tenantId });
    let followUps = await FollowUp.find({ tenantId });

    // Auto-seed sample CRM data if completely empty
    if (customers.length === 0 && leads.length === 0) {
      const cust1 = await Customer.create({
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
        totalPurchases: 495600,
        industry: 'Automotive & Heavy Tooling',
        leadSource: 'Exhibition',
        status: 'active',
      });

      const cust2 = await Customer.create({
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
        totalPurchases: 117710,
        industry: 'Heavy Drivetrain Assembly',
        leadSource: 'Website',
        status: 'active',
      });

      const lead1 = await Lead.create({
        tenantId,
        leadCode: 'LEAD-2026-001',
        companyName: 'Gujarat Polymer & Casting Works',
        contactPerson: 'Harish Patel',
        email: 'hpatel@gujaratpolymer.in',
        phone: '+91 99090 12345',
        source: 'Website',
        status: 'qualified',
        priority: 'High',
        industry: 'Plastics & Polymer Processing',
        requirement: '200 units High-Precision CNC Machined Transmission Shafts',
        estimatedValue: 850000,
        city: 'Ahmedabad',
        state: 'Gujarat',
        notes: 'Requested quotation for 200 units CNC machining shafts.',
      });

      const lead2 = await Lead.create({
        tenantId,
        leadCode: 'LEAD-2026-002',
        companyName: 'Bangalore Precision Hydraulics',
        contactPerson: 'Anand Rao',
        email: 'arao@bangalorehydraulics.in',
        phone: '+91 98800 67890',
        source: 'Exhibition',
        status: 'proposal',
        priority: 'Medium',
        industry: 'Hydraulic Tooling',
        requirement: 'Annual contract for forged hydraulic drive sleeves',
        estimatedValue: 1200000,
        city: 'Bengaluru',
        state: 'Karnataka',
        notes: 'Met at IMTEX 2026. High interest in custom drive shafts.',
      });

      const opp1 = await Opportunity.create({
        tenantId,
        opportunityCode: 'OPP-2026-001',
        opportunityName: 'Gujarat Polymer 200x CNC Machining Contract',
        leadId: lead1._id,
        stage: 'Value Proposition',
        dealValue: 850000,
        probabilityPercent: 70,
        expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        activities: 'Completed initial technical drawing review. Preparing formal quotation.',
        notes: 'Technical specification review in progress.',
      });

      const itemDoc = await Item.findOne({ tenantId });
      const itemRef = itemDoc ? itemDoc._id : null;
      const itemName = itemDoc ? itemDoc.name : 'Heavy Duty Transmission Shaft';

      const quote1 = await Quotation.create({
        tenantId,
        quoteNumber: 'QT-2026-101',
        quoteDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        customerId: cust1._id,
        items: [
          {
            itemId: itemRef,
            name: itemName,
            hsnCode: '8471',
            uom: 'Pcs',
            qty: 50,
            unitPrice: 420,
            discountPercent: 5,
            totalAmount: 19950,
            stockAvailable: itemDoc ? itemDoc.totalStock : 60,
            shortageQty: 0,
            estProductionRequirement: 'Ready in Stock',
          },
        ],
        subTotal: 21000,
        discountTotal: 1050,
        taxAmount: 3591,
        grandTotal: 23541,
        status: 'sent',
        createdBy: req.user.id,
      });

      const so1 = await SalesOrder.create({
        tenantId,
        orderNumber: 'SO-2026-501',
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        customerId: cust1._id,
        quotationId: quote1._id,
        items: [
          {
            itemId: itemRef,
            name: itemName,
            hsnCode: '8471',
            uom: 'Pcs',
            qty: 50,
            unitPrice: 420,
            discountPercent: 5,
            totalAmount: 19950,
            reservedQty: 50,
            shortageQty: 0,
          },
        ],
        subTotal: 21000,
        discountTotal: 1050,
        taxAmount: 3591,
        grandTotal: 23541,
        status: 'In Production',
        inventoryStatus: 'Reserved',
        paymentTerms: 'Net 30 Days',
        createdBy: req.user.id,
      });

      await FollowUp.create({
        tenantId,
        title: 'Call Harish Patel regarding Technical Specifications',
        type: 'Call',
        leadId: lead1._id,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: 'High',
        notes: 'Confirm material grade requirement (4140 Chrome-Moly vs En24).',
        status: 'pending',
      });

      customers = [cust1, cust2];
      leads = [lead1, lead2];
      opportunities = [opp1];
      quotations = [quote1];
      orders = [so1];
      followUps = await FollowUp.find({ tenantId });
    }

    // 10 Detailed Metrics Calculation
    const totalCustomers = customers.length;
    const newLeads = leads.filter((l) => l.status === 'new').length;
    const qualifiedLeads = leads.filter((l) => l.status === 'qualified').length;
    const openOpportunities = opportunities.filter((o) => !['Closed Won', 'Closed Lost'].includes(o.stage)).length;
    const pendingQuotations = quotations.filter((q) => ['draft', 'sent'].includes(q.status)).length;
    const activeSalesOrders = orders.filter((o) => !['Completed', 'Cancelled', 'delivered', 'billed'].includes(o.status)).length;
    
    // Monthly Sales Calculation
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyOrders = orders.filter((o) => {
      const d = new Date(o.orderDate || o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && !['Cancelled'].includes(o.status);
    });
    const monthlySalesRevenue = monthlyOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    const ordersInProduction = orders.filter((o) => ['In Production', 'in_production'].includes(o.status)).length;
    const ordersReadyForDispatch = orders.filter((o) => ['Ready for Dispatch', 'shipped'].includes(o.status)).length;
    const pendingFollowUps = followUps.filter((f) => f.status === 'pending').length;

    res.status(200).json({
      success: true,
      metrics: {
        totalCustomers,
        newLeads,
        qualifiedLeads,
        openOpportunities,
        pendingQuotations,
        activeSalesOrders,
        monthlySalesRevenue: Math.round(monthlySalesRevenue),
        ordersInProduction,
        ordersReadyForDispatch,
        pendingFollowUps,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. CUSTOMER DIRECTORY MANAGEMENT
// ==========================================

export const getCustomers = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const customers = await Customer.find({ tenantId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: customers.length, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { companyName, contactPerson, email, phone, gstin, pan, billingAddress, industry, leadSource, creditLimit } = req.body;

    if (!companyName || !contactPerson || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Company Name, Contact Person, Email, and Phone are required.' });
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
      billingAddress: billingAddress || { street: 'Industrial Zone', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600001' },
      industry: industry || 'Automotive & Heavy Manufacturing',
      leadSource: leadSource || 'Direct Registration',
      creditLimit: Number(creditLimit || 500000),
      salesRep: req.user.id,
      status: 'active',
    });

    res.status(201).json({ success: true, message: `Customer ${customerCode} added successfully!`, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. LEADS MANAGEMENT & CONVERSION
// ==========================================

export const getLeads = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    let query = { tenantId };

    // RBAC: Sales Executives view their assigned leads or unassigned team leads
    if (['Sales Executive', 'Sales Employee', 'CRM Employee'].includes(req.user.role)) {
      query.$or = [{ assignedTo: req.user.id }, { assignedTo: null }, { assignedTo: { $exists: false } }];
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email role')
      .populate('convertedToCustomer', 'companyName customerCode')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leads.length, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { companyName, contactPerson, email, phone, source, estimatedValue, state, city, industry, requirement, priority, notes, assignedTo } = req.body;

    if (!companyName || !contactPerson || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Company Name, Contact Person, Email, and Phone are required.' });
    }

    const count = await Lead.countDocuments({ tenantId });
    const leadCode = `LEAD-2026-${(count + 101).toString()}`;

    const lead = await Lead.create({
      tenantId,
      leadCode,
      companyName,
      contactPerson,
      email,
      phone,
      source: source || 'Website',
      status: 'new',
      priority: priority || 'Medium',
      industry: industry || 'Automotive & Heavy Manufacturing',
      requirement: requirement || '',
      estimatedValue: Number(estimatedValue || 100000),
      state: state || 'Tamil Nadu',
      city: city || 'Chennai',
      notes: notes || '',
      assignedTo: assignedTo || req.user.id,
    });

    // Notify assigned salesperson or Sales Manager
    const notifyRecipient = assignedTo || req.user.id;
    await Notification.create({
      tenantId,
      recipientId: notifyRecipient,
      title: 'New B2B Sales Lead Assigned',
      message: `New Lead [${leadCode}] - ${companyName} (${contactPerson}) has been registered and assigned to you.`,
      type: 'system',
      link: '/crm',
    });

    res.status(201).json({ success: true, message: `Lead ${leadCode} registered successfully!`, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, requirement, notes, assignedTo } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

    if (status) lead.status = status;
    if (priority) lead.priority = priority;
    if (requirement) lead.requirement = requirement;
    if (notes !== undefined) lead.notes = notes;
    if (assignedTo) lead.assignedTo = assignedTo;

    await lead.save();

    res.status(200).json({ success: true, message: `Lead ${lead.leadCode} updated successfully!`, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const convertLeadToCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    if (lead.convertedToCustomer) {
      return res.status(400).json({ success: false, message: 'Lead has already been converted to a Customer.' });
    }

    const tenantId = lead.tenantId;

    // 1. Create B2B Customer Document
    const countCust = await Customer.countDocuments({ tenantId });
    const customerCode = `CUST-${(countCust + 1).toString().padStart(3, '0')}`;

    const newCustomer = await Customer.create({
      tenantId,
      customerCode,
      companyName: lead.companyName,
      contactPerson: lead.contactPerson,
      email: lead.email,
      phone: lead.phone,
      gstin: '33AAACA' + Math.floor(1000 + Math.random() * 9000) + 'A1Z5',
      billingAddress: { street: 'Industrial Estate', city: lead.city || 'Chennai', state: lead.state || 'Tamil Nadu', zipCode: '600001' },
      industry: lead.industry || 'Automotive & Heavy Manufacturing',
      leadSource: lead.source,
      salesRep: lead.assignedTo || req.user.id,
      status: 'active',
    });

    // 2. Create Sales Opportunity Document automatically
    const countOpp = await Opportunity.countDocuments({ tenantId });
    const oppCode = `OPP-2026-${(countOpp + 101).toString()}`;

    const newOpportunity = await Opportunity.create({
      tenantId,
      opportunityCode: oppCode,
      opportunityName: `${lead.companyName} Contract Deal`,
      leadId: lead._id,
      customerId: newCustomer._id,
      stage: 'Qualification',
      dealValue: lead.estimatedValue || 500000,
      probabilityPercent: 60,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      activities: `Converted from Lead ${lead.leadCode}. Customer ${customerCode} registered.`,
      notes: lead.notes || lead.requirement || '',
      assignedTo: lead.assignedTo || req.user.id,
    });

    // Update Lead record
    lead.status = 'won';
    lead.convertedToCustomer = newCustomer._id;
    lead.convertedToOpportunity = newOpportunity._id;
    await lead.save();

    res.status(200).json({
      success: true,
      message: `Lead ${lead.companyName} successfully converted to Customer ${newCustomer.customerCode} and Opportunity ${oppCode}!`,
      customer: newCustomer,
      opportunity: newOpportunity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. SALES OPPORTUNITIES
// ==========================================

export const getOpportunities = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const opportunities = await Opportunity.find({ tenantId })
      .populate('leadId', 'companyName leadCode')
      .populate('customerId', 'companyName customerCode')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: opportunities.length, opportunities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOpportunity = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { opportunityName, leadId, customerId, stage, dealValue, probabilityPercent, expectedCloseDate, activities, notes } = req.body;

    if (!opportunityName || !dealValue) {
      return res.status(400).json({ success: false, message: 'Opportunity Name and Deal Value are required.' });
    }

    const count = await Opportunity.countDocuments({ tenantId });
    const opportunityCode = `OPP-2026-${(count + 101).toString()}`;

    const opportunity = await Opportunity.create({
      tenantId,
      opportunityCode,
      opportunityName,
      leadId: leadId || undefined,
      customerId: customerId || undefined,
      stage: stage || 'Qualification',
      dealValue: Number(dealValue),
      probabilityPercent: Number(probabilityPercent || 50),
      expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      activities: activities || '',
      notes: notes || '',
      assignedTo: req.user.id,
    });

    res.status(201).json({ success: true, message: `Sales Opportunity ${opportunityCode} created!`, opportunity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOpportunityStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, probabilityPercent, dealValue, notes, activities } = req.body;

    const opp = await Opportunity.findById(id);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

    if (stage) opp.stage = stage;
    if (probabilityPercent !== undefined) opp.probabilityPercent = Number(probabilityPercent);
    if (dealValue !== undefined) opp.dealValue = Number(dealValue);
    if (notes !== undefined) opp.notes = notes;
    if (activities !== undefined) opp.activities = activities;

    await opp.save();

    res.status(200).json({ success: true, message: `Opportunity stage updated to ${opp.stage}!`, opportunity: opp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. INVENTORY STOCK-AWARE QUOTATIONS
// ==========================================

// Endpoint to check inventory stock & compute delivery time before issuing quote
export const checkStockForQuotation = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required.' });
    }

    const stockDetails = [];
    let grandSubTotal = 0;
    let totalShortageUnits = 0;
    let maxProductionDays = 0;

    for (const it of items) {
      const itemDoc = await Item.findById(it.itemId);
      if (!itemDoc) continue;

      const reqQty = Number(it.qty || 1);
      const availableStock = itemDoc.totalStock || 0;
      const shortageQty = Math.max(0, reqQty - availableStock);
      const unitPrice = Number(it.unitPrice || itemDoc.unitPrice || 100);
      const discountPercent = Number(it.discountPercent || 0);

      const gross = reqQty * unitPrice;
      const discVal = (gross * discountPercent) / 100;
      const totalAmount = gross - discVal;

      grandSubTotal += totalAmount;
      if (shortageQty > 0) {
        totalShortageUnits += shortageQty;
        const estDays = Math.ceil(shortageQty / 10) + 3; // Estimated 10 units/day + 3 days setup
        maxProductionDays = Math.max(maxProductionDays, estDays);
      }

      stockDetails.push({
        itemId: itemDoc._id,
        name: itemDoc.name,
        hsnCode: itemDoc.itemCode || '8471',
        uom: itemDoc.uom || 'Pcs',
        qty: reqQty,
        unitPrice,
        discountPercent,
        totalAmount: Math.round(totalAmount),
        availableStock,
        shortageQty,
        estProductionRequirement: shortageQty > 0 ? `Shortage of ${shortageQty} units. Production required (~${maxProductionDays} days).` : 'Available in Ready Stock',
      });
    }

    const taxableAmount = grandSubTotal;
    const taxAmount = Math.round(taxableAmount * 0.18);
    const grandTotal = Math.round(taxableAmount + taxAmount);
    const deliveryDays = maxProductionDays > 0 ? maxProductionDays + 2 : 2; // +2 days for dispatch
    const estDeliveryDate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);

    res.status(200).json({
      success: true,
      stockDetails,
      summary: {
        subTotal: Math.round(taxableAmount),
        taxAmount,
        grandTotal,
        totalShortageUnits,
        hasShortage: totalShortageUnits > 0,
        estimatedDeliveryDays: deliveryDays,
        estDeliveryDate,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuotations = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const quotations = await Quotation.find({ tenantId })
      .populate('customerId', 'companyName customerCode email phone billingAddress')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: quotations.length, quotations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createQuotation = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { customerId, validUntil, items, termsAndConditions, opportunityId, leadId } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer and Line Items are required.' });
    }

    let subTotal = 0;
    let discountTotal = 0;
    let maxProductionDays = 0;
    const processedItems = [];

    for (const it of items) {
      const itemDoc = await Item.findById(it.itemId);
      if (!itemDoc) continue;

      const qty = Number(it.qty || 1);
      const unitPrice = Number(it.unitPrice || itemDoc.unitPrice || 0);
      const discountPercent = Number(it.discountPercent || 0);

      const gross = qty * unitPrice;
      const discVal = (gross * discountPercent) / 100;
      const totalAmount = gross - discVal;

      const stockAvailable = itemDoc.totalStock || 0;
      const shortageQty = Math.max(0, qty - stockAvailable);
      if (shortageQty > 0) {
        const estDays = Math.ceil(shortageQty / 10) + 3;
        maxProductionDays = Math.max(maxProductionDays, estDays);
      }

      subTotal += gross;
      discountTotal += discVal;

      processedItems.push({
        itemId: itemDoc._id,
        name: itemDoc.name,
        hsnCode: itemDoc.itemCode || '8471',
        uom: itemDoc.uom || 'Pcs',
        qty,
        unitPrice,
        discountPercent,
        totalAmount: Math.round(totalAmount),
        stockAvailable,
        shortageQty,
        estProductionRequirement: shortageQty > 0 ? `Shortage of ${shortageQty} units. Production required.` : 'Ready in Stock',
      });
    }

    const taxableAmount = subTotal - discountTotal;
    const taxAmount = Math.round(taxableAmount * 0.18);
    const grandTotal = Math.round(taxableAmount + taxAmount);
    const deliveryDays = maxProductionDays > 0 ? maxProductionDays + 2 : 2;
    const expectedDeliveryDate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);

    const count = await Quotation.countDocuments({ tenantId });
    const quoteNumber = `QT-2026-${(count + 101).toString()}`;

    const quotation = await Quotation.create({
      tenantId,
      quoteNumber,
      quoteDate: new Date(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate,
      customerId,
      leadId: leadId || undefined,
      opportunityId: opportunityId || undefined,
      items: processedItems,
      subTotal: Math.round(subTotal),
      discountTotal: Math.round(discountTotal),
      taxAmount,
      grandTotal,
      status: 'sent',
      termsAndConditions: termsAndConditions || '1. Price valid for 30 days. 2. Delivery within estimated timeframe from PO signoff.',
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, message: `Quotation ${quoteNumber} issued successfully!`, quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateQuotationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted', 'rejected', 'sent'

    const quotation = await Quotation.findById(id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    quotation.status = status;
    await quotation.save();

    // Notify created user / Sales Manager
    await Notification.create({
      tenantId: quotation.tenantId,
      recipientId: quotation.createdBy || req.user.id,
      title: `Quotation ${quotation.quoteNumber} ${status.toUpperCase()}`,
      message: `Quotation [${quotation.quoteNumber}] status updated to ${status.toUpperCase()}.`,
      type: 'system',
      link: '/crm',
    });

    res.status(200).json({ success: true, message: `Quotation status updated to ${status}!`, quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const convertQuotationToSalesOrder = async (req, res) => {
  try {
    // Role Hierarchy Enforcement: Sales Executive requires Sales Manager / Admin signoff
    if (['Sales Executive', 'Sales Employee', 'CRM Employee'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Sales Executives cannot convert quotations to Sales Orders directly. Requires Sales Manager or Company Admin approval.',
      });
    }

    const { id } = req.params;
    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    if (quotation.status === 'converted') {
      return res.status(400).json({ success: false, message: 'Quotation has already been converted to a Sales Order.' });
    }

    const tenantId = quotation.tenantId;

    // Check stock for all quotation line items
    let hasShortage = false;
    const orderItems = [];

    for (const it of quotation.items) {
      const itemDoc = await Item.findById(it.itemId);
      const stock = itemDoc ? itemDoc.totalStock : (it.stockAvailable || 0);
      const shortage = Math.max(0, it.qty - stock);
      const reserved = Math.min(it.qty, stock);

      if (shortage > 0) hasShortage = true;

      orderItems.push({
        itemId: it.itemId,
        name: it.name,
        hsnCode: it.hsnCode || '8471',
        uom: it.uom || 'Pcs',
        qty: it.qty,
        unitPrice: it.unitPrice,
        discountPercent: it.discountPercent,
        totalAmount: it.totalAmount,
        reservedQty: reserved,
        shortageQty: shortage,
      });
    }

    const count = await SalesOrder.countDocuments({ tenantId });
    const orderNumber = `SO-2026-${(count + 501).toString()}`;
    const initialStatus = hasShortage ? 'In Production' : 'Confirmed';
    const inventoryStatus = hasShortage ? 'Shortage - Sent to Production' : 'Reserved';

    const salesOrder = await SalesOrder.create({
      tenantId,
      orderNumber,
      orderDate: new Date(),
      deliveryDate: quotation.expectedDeliveryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      customerId: quotation.customerId,
      quotationId: quotation._id,
      items: orderItems,
      subTotal: quotation.subTotal,
      discountTotal: quotation.discountTotal,
      taxAmount: quotation.taxAmount,
      grandTotal: quotation.grandTotal,
      status: initialStatus,
      inventoryStatus,
      paymentTerms: 'Net 30 Days',
      createdBy: req.user.id,
    });

    // If shortage exists, automatically create a Production Order in Production Planning module!
    if (hasShortage) {
      const mainItem = orderItems[0];
      let bomDoc = await BOM.findOne({ tenantId, finishedItemId: mainItem.itemId });
      
      const countProd = await ProductionOrder.countDocuments({ tenantId });
      const prodOrderNumber = `PO-SO-${(countProd + 101).toString()}`;

      await ProductionOrder.create({
        tenantId,
        orderNumber: prodOrderNumber,
        bomId: bomDoc ? bomDoc._id : mainItem.itemId,
        finishedItemId: mainItem.itemId,
        plannedQty: mainItem.shortageQty || mainItem.qty,
        startDate: new Date(),
        dueDate: salesOrder.deliveryDate,
        status: 'scheduled',
      });

      // Notify Production Manager
      const prodManagers = await User.find({ tenantId, role: { $in: ['Production Manager', 'Company Admin', 'Super Admin'] } });
      for (const mgr of prodManagers) {
        await Notification.create({
          tenantId,
          recipientId: mgr._id,
          title: `New Sales Order ${orderNumber} Requires Production`,
          message: `Sales Order [${orderNumber}] has a shortage of ${mainItem.shortageQty} units of ${mainItem.name}. Auto-created Production Order ${prodOrderNumber}.`,
          type: 'system',
          link: '/manufacturing/production',
        });
      }
    }

    // Notify Finance Users for Invoice Preparation
    const finUsers = await User.find({ tenantId, role: { $in: ['Finance', 'Finance Manager', 'Company Admin'] } });
    for (const fin of finUsers) {
      await Notification.create({
        tenantId,
        recipientId: fin._id,
        title: `Sales Order ${orderNumber} Confirmed`,
        message: `New Sales Order [${orderNumber}] (Amount: ₹${salesOrder.grandTotal.toLocaleString('en-IN')}) confirmed. Ready for GST Invoicing.`,
        type: 'system',
        link: '/billing',
      });
    }

    quotation.status = 'converted';
    await quotation.save();

    res.status(200).json({
      success: true,
      message: `Quotation ${quotation.quoteNumber} converted to Sales Order ${orderNumber}! (${hasShortage ? 'Sent to Production Planning due to Stock Shortage' : 'Inventory Stock Reserved'})`,
      salesOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. SALES ORDERS & DISPATCH INTEGRATION
// ==========================================

export const getSalesOrders = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const salesOrders = await SalesOrder.find({ tenantId })
      .populate('customerId', 'companyName customerCode email phone billingAddress')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: salesOrders.length, salesOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSalesOrder = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { customerId, deliveryDate, items, paymentTerms } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer and items are required.' });
    }

    let subTotal = 0;
    let discountTotal = 0;
    let hasShortage = false;
    const processedItems = [];

    for (const it of items) {
      const itemDoc = await Item.findById(it.itemId);
      if (!itemDoc) continue;

      const qty = Number(it.qty || 1);
      const unitPrice = Number(it.unitPrice || itemDoc.unitPrice || 0);
      const discountPercent = Number(it.discountPercent || 0);

      const gross = qty * unitPrice;
      const discVal = (gross * discountPercent) / 100;
      const totalAmount = gross - discVal;

      const stock = itemDoc.totalStock || 0;
      const shortage = Math.max(0, qty - stock);
      const reserved = Math.min(qty, stock);

      if (shortage > 0) hasShortage = true;

      subTotal += gross;
      discountTotal += discVal;

      processedItems.push({
        itemId: itemDoc._id,
        name: itemDoc.name,
        hsnCode: itemDoc.itemCode || '8471',
        uom: itemDoc.uom || 'Pcs',
        qty,
        unitPrice,
        discountPercent,
        totalAmount: Math.round(totalAmount),
        reservedQty: reserved,
        shortageQty: shortage,
      });
    }

    const taxableAmount = subTotal - discountTotal;
    const taxAmount = Math.round(taxableAmount * 0.18);
    const grandTotal = Math.round(taxableAmount + taxAmount);

    const count = await SalesOrder.countDocuments({ tenantId });
    const orderNumber = `SO-2026-${(count + 501).toString()}`;
    const initialStatus = hasShortage ? 'In Production' : 'Confirmed';
    const inventoryStatus = hasShortage ? 'Shortage - Sent to Production' : 'Reserved';

    const salesOrder = await SalesOrder.create({
      tenantId,
      orderNumber,
      orderDate: new Date(),
      deliveryDate: deliveryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      customerId,
      items: processedItems,
      subTotal: Math.round(subTotal),
      discountTotal: Math.round(discountTotal),
      taxAmount,
      grandTotal,
      status: initialStatus,
      inventoryStatus,
      paymentTerms: paymentTerms || 'Net 30 Days',
      createdBy: req.user.id,
    });

    // Auto-create Production Order if stock shortage exists
    if (hasShortage) {
      const mainItem = processedItems[0];
      let bomDoc = await BOM.findOne({ tenantId, finishedItemId: mainItem.itemId });
      const countProd = await ProductionOrder.countDocuments({ tenantId });
      const prodOrderNumber = `PO-SO-${(countProd + 101).toString()}`;

      await ProductionOrder.create({
        tenantId,
        orderNumber: prodOrderNumber,
        bomId: bomDoc ? bomDoc._id : mainItem.itemId,
        finishedItemId: mainItem.itemId,
        plannedQty: mainItem.shortageQty || mainItem.qty,
        startDate: new Date(),
        dueDate: salesOrder.deliveryDate,
        status: 'scheduled',
      });
    }

    res.status(201).json({ success: true, message: `Sales Order ${orderNumber} created successfully!`, salesOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSalesOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Confirmed', 'In Production', 'Ready for Dispatch', 'Dispatched', 'Completed', 'Cancelled'

    const order = await SalesOrder.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Sales Order not found.' });

    const role = req.user.role;

    // RBAC Control: Sales users cannot update production/dispatch states directly!
    if (['Ready for Dispatch', 'Dispatched', 'Completed'].includes(status)) {
      if (!['Super Admin', 'Company Admin', 'Production Manager', 'Warehouse Manager', 'Warehouse Employee'].includes(role)) {
        return res.status(403).json({
          success: false,
          message: `Only Production or Warehouse Managers can update Sales Order status to ${status}.`,
        });
      }
    }

    order.status = status;
    await order.save();

    // Send notifications to sales reps / admin
    await Notification.create({
      tenantId: order.tenantId,
      recipientId: order.createdBy || req.user.id,
      title: `Sales Order ${order.orderNumber} Status Updated`,
      message: `Sales Order [${order.orderNumber}] status changed to ${status.toUpperCase()}.`,
      type: 'system',
      link: '/crm',
    });

    res.status(200).json({ success: true, message: `Sales Order status updated to ${status}!`, salesOrder: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. FOLLOW-UPS & INTERACTION LOG
// ==========================================

export const getFollowUps = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const followUps = await FollowUp.find({ tenantId })
      .populate('customerId', 'companyName contactPerson phone')
      .populate('leadId', 'companyName contactPerson phone')
      .populate('assignedTo', 'name email role')
      .sort({ scheduledDate: 1 });

    res.status(200).json({ success: true, count: followUps.length, followUps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFollowUp = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { title, type, customerId, leadId, opportunityId, scheduledDate, priority, notes } = req.body;

    if (!title || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Title and Scheduled Date are required.' });
    }

    const followUp = await FollowUp.create({
      tenantId,
      title,
      type: type || 'Call',
      customerId: customerId || undefined,
      leadId: leadId || undefined,
      opportunityId: opportunityId || undefined,
      scheduledDate,
      priority: priority || 'Medium',
      notes: notes || '',
      status: 'pending',
      assignedTo: req.user.id,
    });

    // Notify assigned salesperson
    await Notification.create({
      tenantId,
      recipientId: req.user.id,
      title: 'Follow-Up Reminder Scheduled',
      message: `Follow-up task [${title}] scheduled for ${new Date(scheduledDate).toLocaleDateString()}.`,
      type: 'system',
      link: '/crm',
    });

    res.status(201).json({ success: true, message: 'Follow-up task scheduled successfully!', followUp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFollowUpStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const followUp = await FollowUp.findById(id);

    if (!followUp) return res.status(404).json({ success: false, message: 'Follow-up task not found.' });

    followUp.status = followUp.status === 'completed' ? 'pending' : 'completed';
    await followUp.save();

    res.status(200).json({ success: true, message: `Follow-up marked as ${followUp.status.toUpperCase()}!`, followUp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 8. CRM SALES REPORTS & ANALYTICS
// ==========================================

export const getCrmReports = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const leads = await Lead.find({ tenantId }).populate('assignedTo', 'name email');
    const opportunities = await Opportunity.find({ tenantId }).populate('assignedTo', 'name email');
    const quotations = await Quotation.find({ tenantId });
    const orders = await SalesOrder.find({ tenantId }).populate('customerId', 'companyName');
    const customers = await Customer.find({ tenantId });

    const totalLeads = leads.length;
    const wonLeads = leads.filter((l) => l.status === 'won').length;
    const leadConversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    const totalOpportunityValue = opportunities.reduce((s, o) => s + (o.dealValue || 0), 0);

    const totalQuotationValue = quotations.reduce((s, q) => s + (q.grandTotal || 0), 0);
    const convertedQuotations = quotations.filter((q) => q.status === 'converted').length;
    const quotationConversionRate = quotations.length > 0 ? Math.round((convertedQuotations / quotations.length) * 100) : 0;

    const totalSalesOrderValue = orders.reduce((s, o) => s + (o.grandTotal || 0), 0);

    // Salesperson Performance Breakdown
    const repPerformanceMap = {};
    orders.forEach((o) => {
      const repName = o.createdBy?.name || 'Sales Desk';
      repPerformanceMap[repName] = (repPerformanceMap[repName] || 0) + o.grandTotal;
    });

    // Customer-wise Sales Breakdown
    const customerSalesMap = {};
    orders.forEach((o) => {
      const custName = o.customerId?.companyName || 'B2B Client';
      customerSalesMap[custName] = (customerSalesMap[custName] || 0) + o.grandTotal;
    });

    // Lost Opportunities Count & Value
    const lostOppList = opportunities.filter((o) => o.stage === 'Closed Lost');
    const lostOpportunityValue = lostOppList.reduce((s, o) => s + (o.dealValue || 0), 0);

    res.status(200).json({
      success: true,
      analytics: {
        totalLeads,
        wonLeads,
        leadConversionRate,
        totalOpportunityValue: Math.round(totalOpportunityValue),
        totalQuotationValue: Math.round(totalQuotationValue),
        quotationConversionRate,
        totalSalesOrderValue: Math.round(totalSalesOrderValue),
        lostOpportunityCount: lostOppList.length,
        lostOpportunityValue: Math.round(lostOpportunityValue),
        repPerformance: repPerformanceMap,
        customerWiseSales: customerSalesMap,
        customerCount: customers.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
