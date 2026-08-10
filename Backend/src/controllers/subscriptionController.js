import Company from '../models/Company.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import SubscriptionInvoice from '../models/SubscriptionInvoice.js';
import User from '../models/User.js';

// ==========================================
// 1. SUPER ADMIN SUBSCRIPTION PLAN MANAGEMENT
// ==========================================

export const getSubscriptionPlans = async (req, res) => {
  try {
    let plans = await SubscriptionPlan.find({}).sort({ monthlyPrice: 1 });

    // Seed default plans if none exist
    if (plans.length === 0) {
      plans = await SubscriptionPlan.insertMany([
        {
          name: 'Basic',
          monthlyPrice: 4999,
          yearlyPrice: 49990,
          maxUsers: 15,
          storageLimitMB: 2048, // 2 GB
          includedModules: ['HRMS', 'Inventory', 'GST Billing'],
          features: ['Single Plant', 'Standard Email Support', 'Basic Reports'],
          isActive: true,
        },
        {
          name: 'Professional',
          monthlyPrice: 14999,
          yearlyPrice: 149990,
          maxUsers: 50,
          storageLimitMB: 10240, // 10 GB
          includedModules: ['HRMS', 'Payroll', 'Inventory', 'Warehouse', 'Purchase', 'Production', 'GST Billing', 'CRM'],
          features: ['Multi-Warehouse', 'QR Inventory Tracking', 'Priority Support', 'Custom Export Reports'],
          isActive: true,
        },
        {
          name: 'Enterprise',
          monthlyPrice: 29999,
          yearlyPrice: 299990,
          maxUsers: 500,
          storageLimitMB: 51200, // 50 GB
          includedModules: ['HRMS', 'Payroll', 'Inventory', 'Warehouse', 'Purchase', 'Production', 'Machine Maintenance', 'GST Billing', 'CRM', 'AI Sales Prediction'],
          features: ['Unlimited Plants', 'AI Predictive Demand Engine', 'Dedicated Account Manager', '24/7 Phone Support', 'Real-Time Socket.IO Analytics'],
          isActive: true,
        },
      ]);
    }

    res.status(200).json({ success: true, count: plans.length, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubscriptionPlan = async (req, res) => {
  try {
    const { name, monthlyPrice, yearlyPrice, maxUsers, storageLimitMB, includedModules, features } = req.body;

    if (!name || !monthlyPrice || !maxUsers) {
      return res.status(400).json({ success: false, message: 'Plan Name, Pricing, and User Limits are required.' });
    }

    const plan = await SubscriptionPlan.create({
      name,
      monthlyPrice: Number(monthlyPrice),
      yearlyPrice: Number(yearlyPrice || monthlyPrice * 10),
      maxUsers: Number(maxUsers),
      storageLimitMB: Number(storageLimitMB || 10240),
      includedModules: includedModules || ['HRMS', 'Inventory', 'GST Billing'],
      features: features || ['Standard Support'],
      isActive: true,
    });

    res.status(201).json({ success: true, message: `Subscription Plan ${name} created successfully!`, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePlanStatus = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Subscription Plan not found.' });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Subscription Plan ${plan.name} is now ${plan.isActive ? 'ENABLED' : 'DISABLED'}!`,
      plan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const onboardTenantCompany = async (req, res) => {
  try {
    const {
      name,
      industry,
      gstin,
      regNumber,
      contactEmail,
      phone,
      address,
      city,
      state,
      country,
      timeZone,
      currency,
      adminName,
      adminEmail,
      adminPhone,
      subscriptionPlan,
      billingCycle,
      startDate,
      subscriptionExpiryDate,
      maxEmployees,
      storageLimitMB,
      enabledModules,
      status,
    } = req.body;

    if (!name || !contactEmail || !adminEmail) {
      return res.status(400).json({ success: false, message: 'Company Name, Contact Email, and Admin Email are required.' });
    }

    // Auto-generate company code
    const compCount = await Company.countDocuments();
    const code = `COMP-${(compCount + 101).toString()}`;

    const company = await Company.create({
      name,
      code,
      industry: industry || 'Manufacturing',
      gstin: gstin || '',
      regNumber: regNumber || '',
      contactEmail,
      phone: phone || '',
      address: {
        street: address || '',
        city: city || '',
        state: state || '',
        country: country || 'India',
        zipCode: '400001',
      },
      timeZone: timeZone || 'Asia/Kolkata (IST)',
      currency: currency || 'INR (₹)',
      adminName: adminName || 'Company Admin',
      adminEmail: adminEmail.toLowerCase(),
      adminPhone: adminPhone || '',
      subscriptionPlan: subscriptionPlan || 'Enterprise',
      billingCycle: billingCycle || 'yearly',
      startDate: startDate || new Date(),
      subscriptionExpiryDate: subscriptionExpiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxEmployees: Number(maxEmployees || 100),
      storageLimitMB: Number(storageLimitMB || 10240),
      enabledModules: enabledModules || ['HRMS', 'Payroll', 'Inventory', 'Warehouse', 'Production', 'CRM', 'Finance', 'Reports'],
      status: status || 'active',
    });

    // Auto-create Company Admin user account
    let adminUser = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!adminUser) {
      adminUser = await User.create({
        name: adminName || `${name} Admin`,
        email: adminEmail.toLowerCase(),
        password: 'Password123!', // Standard initial password
        role: 'Company Admin',
        tenantId: company._id,
        status: 'active',
        department: 'Executive Management',
        designation: 'Managing Director / Admin',
      });
    }

    res.status(201).json({
      success: true,
      message: `Tenant Company ${name} (${code}) onboarded successfully! Admin login credentials created.`,
      company,
      adminUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTenantSubscriptions = async (req, res) => {
  try {
    const companies = await Company.find({}).sort({ createdAt: -1 });
    const formattedCompanies = [];

    for (const comp of companies) {
      const activeUsersCount = await User.countDocuments({ tenantId: comp._id, status: 'active' });
      formattedCompanies.push({
        _id: comp._id,
        name: comp.name,
        code: comp.code,
        industry: comp.industry,
        gstin: comp.gstin,
        regNumber: comp.regNumber,
        contactEmail: comp.contactEmail,
        phone: comp.phone,
        address: comp.address,
        timeZone: comp.timeZone,
        currency: comp.currency,
        adminName: comp.adminName,
        adminEmail: comp.adminEmail,
        adminPhone: comp.adminPhone,
        subscriptionPlan: comp.subscriptionPlan,
        billingCycle: comp.billingCycle,
        startDate: comp.startDate,
        subscriptionExpiryDate: comp.subscriptionExpiryDate,
        maxEmployees: comp.maxEmployees,
        activeUsersCount,
        storageUsedMB: comp.storageUsedMB,
        storageLimitMB: comp.storageLimitMB,
        enabledModules: comp.enabledModules,
        status: comp.status,
      });
    }

    res.status(200).json({ success: true, count: formattedCompanies.length, companies: formattedCompanies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleTenantCompanyStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Tenant Company not found.' });
    }

    const nextStatus = status || (company.status === 'active' ? 'suspended' : 'active');
    company.status = nextStatus;
    await company.save();

    res.status(200).json({
      success: true,
      message: `Tenant Company ${company.name} is now ${nextStatus.toUpperCase()}! ${
        nextStatus === 'suspended' ? 'User logins are blocked while 100% of data remains preserved.' : 'Company access restored.'
      }`,
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const renewTenantSubscription = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { extensionMonths = 12 } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Tenant Company not found.' });
    }

    const currentExpiry = new Date(company.subscriptionExpiryDate > new Date() ? company.subscriptionExpiryDate : Date.now());
    currentExpiry.setMonth(currentExpiry.getMonth() + Number(extensionMonths));

    company.subscriptionExpiryDate = currentExpiry;
    company.status = 'active';
    await company.save();

    // Create Subscription Billing Invoice Record
    const planDoc = await SubscriptionPlan.findOne({ name: company.subscriptionPlan });
    const price = extensionMonths === 12 ? planDoc?.yearlyPrice || 249990 : planDoc?.monthlyPrice || 24999;
    const tax = Math.round(price * 0.18);
    const count = await SubscriptionInvoice.countDocuments({ tenantId: company._id });

    const invoice = await SubscriptionInvoice.create({
      tenantId: company._id,
      invoiceNumber: `SUB-RENEW-${(count + 101).toString()}`,
      planName: company.subscriptionPlan,
      billingCycle: extensionMonths === 12 ? 'yearly' : 'monthly',
      amount: price,
      taxAmount: tax,
      totalAmount: price + tax,
      paymentStatus: 'paid',
      paymentMethod: 'Super Admin Manual Renewal / Direct Wire',
      invoiceDate: new Date(),
      dueDate: currentExpiry,
    });

    res.status(200).json({
      success: true,
      message: `Subscription for ${company.name} successfully renewed until ${currentExpiry.toLocaleDateString()}!`,
      company,
      invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTenantCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Tenant Company not found.' });
    }

    await Company.findByIdAndDelete(companyId);
    await User.deleteMany({ tenantId: companyId });

    res.status(200).json({
      success: true,
      message: `Tenant Company ${company.name} and associated user accounts deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCompanySubscription = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { subscriptionPlan, maxEmployees, status, billingCycle, storageLimitMB, enabledModules, gstin, regNumber, phone } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Tenant Company not found.' });
    }

    if (subscriptionPlan) company.subscriptionPlan = subscriptionPlan;
    if (maxEmployees) company.maxEmployees = maxEmployees;
    if (status) company.status = status;
    if (billingCycle) company.billingCycle = billingCycle;
    if (storageLimitMB) company.storageLimitMB = storageLimitMB;
    if (enabledModules) company.enabledModules = enabledModules;
    if (gstin !== undefined) company.gstin = gstin;
    if (regNumber !== undefined) company.regNumber = regNumber;
    if (phone !== undefined) company.phone = phone;

    await company.save();

    res.status(200).json({ success: true, message: `Tenant Company ${company.name} updated successfully!`, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. TENANT COMPANY ADMIN SUBSCRIPTION & INVOICES
// ==========================================

export const getCompanySubscriptionDetails = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const company = await Company.findById(tenantId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const activeUsersCount = await User.countDocuments({ tenantId, status: 'active' });
    const planDoc = await SubscriptionPlan.findOne({ name: company.subscriptionPlan });

    res.status(200).json({
      success: true,
      subscription: {
        companyName: company.name,
        planName: company.subscriptionPlan,
        billingCycle: company.billingCycle,
        maxEmployees: company.maxEmployees,
        activeUsersCount,
        storageUsedMB: company.storageUsedMB,
        storageLimitMB: company.storageLimitMB,
        expiryDate: company.subscriptionExpiryDate,
        autoRenew: company.autoRenew,
        status: company.status,
        planDetails: planDoc || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubscriptionInvoices = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    let invoices = await SubscriptionInvoice.find({ tenantId }).sort({ invoiceDate: -1 });

    // Seed sample subscription billing invoice if empty
    if (invoices.length === 0) {
      const company = await Company.findById(tenantId);
      const inv = await SubscriptionInvoice.create({
        tenantId,
        invoiceNumber: 'SUB-2026-101',
        planName: company?.subscriptionPlan || 'Enterprise',
        billingCycle: 'yearly',
        amount: 254228,
        taxAmount: 45762,
        totalAmount: 299990,
        paymentStatus: 'paid',
        paymentMethod: 'Corporate HDFC Banking NEFT',
        invoiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      });
      invoices = [inv];
    }

    res.status(200).json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upgradeSubscriptionPlan = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { newPlanName, billingCycle } = req.body;

    const company = await Company.findById(tenantId);
    const plan = await SubscriptionPlan.findOne({ name: newPlanName });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Requested Subscription Plan not found.' });
    }

    company.subscriptionPlan = plan.name;
    company.maxEmployees = plan.maxUsers;
    company.storageLimitMB = plan.storageLimitMB;
    company.billingCycle = billingCycle || 'yearly';
    company.subscriptionExpiryDate = new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000);
    company.status = 'active';

    await company.save();

    // Create Subscription Invoice Record
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const tax = Math.round(price * 0.18);
    const count = await SubscriptionInvoice.countDocuments({ tenantId });
    const invoiceNumber = `SUB-2026-${(count + 101).toString()}`;

    const invoice = await SubscriptionInvoice.create({
      tenantId,
      invoiceNumber,
      planName: plan.name,
      billingCycle: billingCycle || 'yearly',
      amount: price,
      taxAmount: tax,
      totalAmount: price + tax,
      paymentStatus: 'paid',
      paymentMethod: 'Corporate Credit Card Auto-Charge',
      invoiceDate: new Date(),
      dueDate: company.subscriptionExpiryDate,
    });

    res.status(200).json({
      success: true,
      message: `Subscription successfully upgraded to ${plan.name} Tier!`,
      company,
      invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
