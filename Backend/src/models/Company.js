import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Company code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    industry: {
      type: String,
      default: 'Automotive & Heavy Manufacturing',
    },
    subscriptionPlan: {
      type: String,
      enum: ['Basic', 'Starter', 'Professional', 'Enterprise', 'Custom'],
      default: 'Enterprise',
    },
    maxEmployees: {
      type: Number,
      default: 500,
    },
    storageUsedMB: {
      type: Number,
      default: 120,
    },
    storageLimitMB: {
      type: Number,
      default: 10240, // 10 GB
    },
    gstin: {
      type: String,
      default: '',
    },
    regNumber: {
      type: String,
      default: '',
    },
    timeZone: {
      type: String,
      default: 'Asia/Kolkata (IST)',
    },
    currency: {
      type: String,
      default: 'INR (₹)',
    },
    adminName: {
      type: String,
      default: 'Company Admin',
    },
    adminEmail: {
      type: String,
      default: '',
    },
    adminPhone: {
      type: String,
      default: '',
    },
    enabledModules: [
      {
        type: String,
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    subscriptionExpiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'yearly',
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['trial', 'active', 'suspended', 'expired', 'pending'],
      default: 'active',
    },
    contactEmail: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Company', companySchema);
