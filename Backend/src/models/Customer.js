import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    customerCode: {
      type: String,
      required: true, // e.g., "CUST-001"
    },
    companyName: {
      type: String,
      required: [true, 'Customer company name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    gstin: {
      type: String,
      uppercase: true,
      trim: true,
    },
    pan: {
      type: String,
      uppercase: true,
      trim: true,
    },
    billingAddress: {
      street: String,
      city: String,
      state: { type: String, required: true },
      stateCode: String, // e.g. "33" for Tamil Nadu, "27" for Maharashtra
      zipCode: String,
      country: { type: String, default: 'India' },
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    creditLimit: {
      type: Number,
      default: 500000,
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    industry: {
      type: String,
      default: 'Automotive & Heavy Manufacturing',
    },
    leadSource: {
      type: String,
      default: 'Direct',
    },
    salesRep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Customer', customerSchema);
