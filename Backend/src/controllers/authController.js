import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import Company from '../models/Company.js';
import { sendEmail } from '../utils/sendEmail.js';

// Helper to generate JWT Token
const generateToken = (user, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : (process.env.JWT_EXPIRE || '7d');
  const secret = process.env.JWT_SECRET || 'saas_erp_super_secure_jwt_secret_key_2026_manufacturing';
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      tenantId: user.tenantId?._id || user.tenantId || null,
      email: user.email,
    },
    secret,
    { expiresIn }
  );
};

// @desc    Login user (Unified sign-in, auto role identification)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check if database has been seeded
    const totalUsersCount = await User.countDocuments();
    if (totalUsersCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Database is empty. Please run seed script or create admin account.',
      });
    }

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('tenantId', 'name code industry subscriptionPlan status');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    if (user.role !== 'Super Admin' && user.tenantId) {
      if (user.tenantId.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: `Company access for [${user.tenantId.name}] is currently SUSPENDED. All company data remains preserved. Please contact Super Admin to reactivate access.`,
        });
      }
      if (user.tenantId.status === 'expired' || (user.tenantId.subscriptionExpiryDate && new Date(user.tenantId.subscriptionExpiryDate) < new Date())) {
        return res.status(403).json({
          success: false,
          message: `Company subscription for [${user.tenantId.name}] has EXPIRED. Please renew subscription to restore access.`,
        });
      }
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact your administrator.',
      });
    }

    if (user.status === 'pending_invitation') {
      return res.status(400).json({
        success: false,
        message: 'Please accept your email invitation and set up your password before logging in.',
      });
    }

    // Check password
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Account has no password set. Please use password reset or invite link.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    // Update last login timestamp safely without triggering save hooks
    await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

    // Generate JWT
    const token = generateToken(user, rememberMe);

    // Filter sensitive fields
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      tenant: user.tenantId,
      status: user.status,
    };

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}! Sign-in successful.`,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('[LOGIN EXCEPTION LOG]:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to a server error.',
      error: error.message,
    });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      'tenantId',
      'name code industry subscriptionPlan status'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        tenant: user.tenantId,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password - Send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">SaaS ERP Manufacturing Security</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your SaaS ERP account.</p>
        <p>Click the button below to reset your password. This link is valid for 30 minutes:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'SaaS ERP - Password Reset Request',
        html: htmlContent,
      });
    } catch (e) {
      console.warn('[Email Warning]: Reset email dispatch failed, proceeding with URL token:', e.message);
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
      debugResetUrl: resetUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password using token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept Invitation and Set Initial Password
// @route   POST /api/auth/accept-invite
// @access  Public
export const acceptInvitation = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const invitation = await Invitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: Date.now() },
    });

    if (!invitation) {
      return res.status(400).json({
        success: false,
        message: 'Invitation link is invalid or has expired.',
      });
    }

    let user = await User.findOne({ email: invitation.email.toLowerCase() });

    if (user) {
      user.password = password;
      user.status = 'active';
      user.mustChangePassword = false;
      await user.save();
    } else {
      user = await User.create({
        name: invitation.name,
        email: invitation.email.toLowerCase(),
        password,
        role: invitation.role,
        tenantId: invitation.tenantId,
        department: invitation.department,
        designation: invitation.designation,
        status: 'active',
      });
    }

    invitation.status = 'accepted';
    await invitation.save();

    await user.populate('tenantId', 'name code industry subscriptionPlan status');

    const jwtToken = generateToken(user, false);

    res.status(200).json({
      success: true,
      message: 'Password set successfully! Redirecting to your dashboard...',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        tenant: user.tenantId,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
