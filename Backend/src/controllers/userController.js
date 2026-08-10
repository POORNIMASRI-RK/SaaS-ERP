import crypto from 'crypto';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import Company from '../models/Company.js';
import { sendEmail } from '../utils/sendEmail.js';

// Helper to generate unique Employee ID if not provided (e.g. EMP-1001)
const generateEmployeeId = async (tenantId) => {
  const count = await User.countDocuments({ tenantId });
  const nextNum = 1001 + count;
  return `EMP-${nextNum}`;
};

// @desc    Verify invitation token (Public endpoint for Set Password page)
// @route   GET /api/users/invite/:token
// @access  Public
export const getInvitationDetails = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await Invitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: Date.now() },
    }).populate('tenantId', 'name code industry');

    if (!invitation) {
      return res.status(400).json({
        success: false,
        message: 'Invitation link is invalid or has expired.',
      });
    }

    res.status(200).json({
      success: true,
      invitation: {
        name: invitation.name,
        email: invitation.email,
        role: invitation.role,
        department: invitation.department,
        designation: invitation.designation,
        companyName: invitation.tenantId ? invitation.tenantId.name : 'SaaS ERP Manufacturing',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users for tenant with search, filtering, and pagination
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const { q, department, role, status, page = 1, limit = 50 } = req.query;

    let query = {};

    // Enforce Tenant Data Isolation
    if (req.user.role !== 'Super Admin') {
      query.tenantId = req.user.tenantId;
    } else if (req.query.tenantId) {
      query.tenantId = req.query.tenantId;
    }

    // Search query (Name, Email, Employee ID, Phone)
    if (q) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { phoneNumber: searchRegex },
        { designation: searchRegex },
      ];
    }

    // Filters
    if (department && department !== 'ALL') {
      query.department = department;
    }

    if (role && role !== 'ALL') {
      query.role = role;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('tenantId', 'name code industry')
      .populate('reportingManager', 'name email role designation department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Employee Profile
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('tenantId', 'name code industry contactEmail phone')
      .populate('reportingManager', 'name email role designation department phoneNumber');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    // Security check: Ensure user belongs to same tenant unless Super Admin
    if (req.user.role !== 'Super Admin' && user.tenantId?._id.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to another company employee.' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new Employee & Dispatch One-Time Activation Email
// @route   POST /api/users
// @access  Private (Company Admin, HR, Manager)
export const createUser = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      phoneNumber,
      department,
      designation,
      reportingManager,
      role,
      joiningDate,
      branchLocation,
    } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and role are required fields.',
      });
    }

    const tenantId = req.user.role === 'Super Admin' ? req.body.tenantId || req.tenantId : req.user.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required for employee creation.',
      });
    }

    // Role level check: Managers can only invite Team Leaders or Employees
    if (req.user.role === 'Manager' && !['Team Leader', 'Employee'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Managers are authorized to add Team Leaders or Employees only.',
      });
    }

    // Check existing email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email [${email}] already exists in the system.`,
      });
    }

    // Generate unique employee ID if not provided
    const finalEmployeeId = employeeId
      ? employeeId.toUpperCase().trim()
      : await generateEmployeeId(tenantId);

    // Create temporary random password
    const tempPassword = crypto.randomBytes(16).toString('hex');

    // Create Employee record with pending_invitation status
    const newUser = await User.create({
      employeeId: finalEmployeeId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: tempPassword,
      phoneNumber: phoneNumber || '',
      department: department || 'General Assembly',
      designation: designation || 'Staff',
      reportingManager: reportingManager || null,
      role,
      joiningDate: joiningDate || new Date(),
      branchLocation: branchLocation || 'Main Plant',
      tenantId,
      status: 'pending_invitation',
      mustChangePassword: true,
    });

    // Create invitation record & token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await Invitation.create({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      designation: newUser.designation,
      tenantId,
      invitedBy: req.user._id,
      token,
      expiresAt,
    });

    const tenant = await Company.findById(tenantId);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const setPasswordUrl = `${clientUrl}/set-password?token=${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1e3a8a; margin: 0;">${tenant ? tenant.name : 'SaaS ERP Manufacturing'}</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Employee Account Activation</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #334155; font-size: 16px;">Hello <strong>${newUser.name}</strong>,</p>
        <p style="color: #475569; line-height: 1.6;">
          Your employee account (<strong style="color: #1e3a8a;">${newUser.employeeId}</strong>) has been created by <strong>${req.user.name}</strong> (${req.user.role}).
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; margin: 15px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Role:</strong> ${role}</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;"><strong>Department:</strong> ${newUser.department}</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;"><strong>Designation:</strong> ${newUser.designation}</p>
        </div>
        <p style="color: #475569; line-height: 1.6;">
          Please click the button below to set up your account password and access your dashboard:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${setPasswordUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Activate Account &amp; Set Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all;"><a href="${setPasswordUrl}" style="color: #2563eb;">${setPasswordUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">This activation link will expire in 7 days.</p>
      </div>
    `;

    await sendEmail({
      to: newUser.email,
      subject: `Account Activation - Welcome to ${tenant ? tenant.name : 'SaaS ERP'}`,
      html: htmlContent,
    });

    const populatedUser = await User.findById(newUser._id)
      .select('-password')
      .populate('tenantId', 'name code')
      .populate('reportingManager', 'name email role');

    res.status(201).json({
      success: true,
      message: `Employee [${newUser.name}] added successfully! One-time activation email dispatched to ${newUser.email}.`,
      user: populatedUser,
      activationLink: setPasswordUrl,
      inviteLink: setPasswordUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const inviteUser = createUser;

// @desc    Update Employee Profile Details
// @route   PUT /api/users/:id
// @access  Private (Company Admin, HR, Manager)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phoneNumber,
      department,
      designation,
      reportingManager,
      role,
      joiningDate,
      branchLocation,
    } = req.body;

    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Tenant boundary check
    if (req.user.role !== 'Super Admin' && user.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot modify employee belonging to another tenant.' });
    }

    if (name) user.name = name.trim();
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (department) user.department = department.trim();
    if (designation) user.designation = designation.trim();
    if (reportingManager !== undefined) user.reportingManager = reportingManager || null;
    if (role) user.role = role;
    if (joiningDate) user.joiningDate = joiningDate;
    if (branchLocation) user.branchLocation = branchLocation;

    await user.save();

    const updatedUser = await User.findById(id)
      .select('-password')
      .populate('tenantId', 'name code')
      .populate('reportingManager', 'name email role designation');

    res.status(200).json({
      success: true,
      message: `Employee profile [${user.name}] updated successfully.`,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Employee Status (Active <-> Inactive)
// @route   PATCH /api/users/:id/status
// @access  Private (Company Admin, HR)
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be active or inactive.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (req.user.role !== 'Super Admin' && user.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot update status of employee in another company.' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Employee [${user.name}] status updated to [${status.toUpperCase()}].`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trigger One-Time Password Reset Email
// @route   POST /api/users/:id/reset-password-invite
// @access  Private (Company Admin, HR)
export const sendPasswordResetInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (req.user.role !== 'Super Admin' && user.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">SaaS ERP - Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>An administrator has issued a password reset request for your account.</p>
        <p>Click below to set your new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Set New Password</a>
        </div>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'SaaS ERP - Password Reset Link',
      html: htmlContent,
    });

    res.status(200).json({
      success: true,
      message: `Password reset email dispatched to ${user.email}`,
      resetUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Employee Account
// @route   DELETE /api/users/:id
// @access  Private (Company Admin, HR)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (user.role === 'Company Admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Company Admin account cannot be deleted.' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own logged-in account.' });
    }

    if (req.user.role !== 'Super Admin' && user.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot delete employee belonging to another tenant.' });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Employee account [${user.name}] deleted permanently.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
