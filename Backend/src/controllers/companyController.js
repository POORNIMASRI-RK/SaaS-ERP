import Company from '../models/Company.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Get all companies (Super Admin) or current company (Company Admin)
// @route   GET /api/companies
// @access  Private
export const getCompanies = async (req, res) => {
  try {
    if (req.user.role === 'Super Admin') {
      const companies = await Company.find().sort({ createdAt: -1 });

      // Attach user count for each tenant
      const companiesWithCounts = await Promise.all(
        companies.map(async (comp) => {
          const userCount = await User.countDocuments({ tenantId: comp._id });
          return {
            ...comp.toObject(),
            userCount,
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: companiesWithCounts.length,
        companies: companiesWithCounts,
      });
    }

    // Company Admin or other tenant roles
    const company = await Company.findById(req.user.tenantId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Tenant Company not found' });
    }

    const userCount = await User.countDocuments({ tenantId: company._id });
    res.status(200).json({
      success: true,
      companies: [{ ...company.toObject(), userCount }],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new Tenant Company & Auto-Provision Company Admin
// @route   POST /api/companies
// @access  Private (Super Admin)
export const createCompany = async (req, res) => {
  try {
    const {
      name,
      code,
      industry,
      contactEmail,
      phone,
      maxEmployees,
      subscriptionPlan,
      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    if (!name || !code || !contactEmail) {
      return res.status(400).json({
        success: false,
        message: 'Company Name, Tenant Code, and Contact Email are required.',
      });
    }

    const existingCode = await Company.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `Tenant Code [${code.toUpperCase()}] is already in use by another company.`,
      });
    }

    // Create Company
    const company = await Company.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      industry: industry || 'Automotive & Heavy Manufacturing',
      contactEmail: contactEmail.toLowerCase().trim(),
      phone: phone || '',
      maxEmployees: maxEmployees || 500,
      subscriptionPlan: subscriptionPlan || 'Enterprise',
      status: 'active',
    });

    // Auto-create Company Admin account for this new tenant
    const companyAdminEmail = (adminEmail || contactEmail).toLowerCase().trim();
    let companyAdmin = await User.findOne({ email: companyAdminEmail });

    if (!companyAdmin) {
      const defaultPassword = adminPassword || 'Password123!';
      companyAdmin = await User.create({
        name: adminName || `${company.name} Admin`,
        email: companyAdminEmail,
        password: defaultPassword,
        role: 'Company Admin',
        tenantId: company._id,
        department: 'Executive Management',
        designation: 'Managing Director / Plant Head',
        status: 'active',
      });
    } else {
      // Re-assign user if exists
      companyAdmin.tenantId = company._id;
      companyAdmin.role = 'Company Admin';
      await companyAdmin.save();
    }

    res.status(201).json({
      success: true,
      message: `Tenant company [${company.name}] and Company Admin account created successfully!`,
      company: {
        ...company.toObject(),
        userCount: 1,
        companyAdmin: {
          id: companyAdmin._id,
          name: companyAdmin.name,
          email: companyAdmin.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Tenant Company Details
// @route   PUT /api/companies/:id
// @access  Private (Super Admin)
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry, contactEmail, phone, maxEmployees, subscriptionPlan } = req.body;

    let company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (name) company.name = name.trim();
    if (industry) company.industry = industry.trim();
    if (contactEmail) company.contactEmail = contactEmail.toLowerCase().trim();
    if (phone !== undefined) company.phone = phone;
    if (maxEmployees) company.maxEmployees = maxEmployees;
    if (subscriptionPlan) company.subscriptionPlan = subscriptionPlan;

    await company.save();

    res.status(200).json({
      success: true,
      message: `Company [${company.name}] updated successfully.`,
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Tenant Status (Active <-> Suspended)
// @route   PATCH /api/companies/:id/status
// @access  Private (Super Admin)
export const toggleCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be active or suspended.' });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    company.status = status;
    await company.save();

    // If suspended, update status of all users in this company
    if (status === 'suspended') {
      await User.updateMany({ tenantId: company._id }, { status: 'inactive' });
    } else if (status === 'active') {
      await User.updateMany({ tenantId: company._id, status: 'inactive' }, { status: 'active' });
    }

    res.status(200).json({
      success: true,
      message: `Tenant [${company.name}] status updated to [${status.toUpperCase()}].`,
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Tenant Company & associated users
// @route   DELETE /api/companies/:id
// @access  Private (Super Admin)
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Remove users associated with this tenant
    await User.deleteMany({ tenantId: company._id });

    // Remove company
    await Company.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Tenant Company [${company.name}] and all associated user records deleted.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Global System & Tenant Metrics
// @route   GET /api/companies/stats
// @access  Private
export const getCompanyStats = async (req, res) => {
  try {
    if (req.user.role === 'Super Admin') {
      const totalCompanies = await Company.countDocuments();
      const activeCompanies = await Company.countDocuments({ status: 'active' });
      const suspendedCompanies = await Company.countDocuments({ status: 'suspended' });
      const totalUsers = await User.countDocuments();
      const roleBreakdown = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalCompanies,
          activeCompanies,
          suspendedCompanies,
          totalUsers,
          roleBreakdown,
          systemStatus: 'Optimal',
          uptime: '99.99%',
        },
      });
    }

    const tenantId = req.user.tenantId;
    const totalEmployees = await User.countDocuments({ tenantId });
    const departmentBreakdown = await User.aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        departmentBreakdown,
        plantStatus: 'Active Production Mode',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
