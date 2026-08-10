import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    vendorCode: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    gstin: {
      type: String,
      default: '',
    },
    pan: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    bankDetails: {
      accountNo: String,
      ifsc: String,
      bankName: String,
      branch: String,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    performanceScore: {
      type: Number,
      default: 95, // Percentage
    },
    outstandingBalance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'blacklisted', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

vendorSchema.index({ tenantId: 1, vendorCode: 1 }, { unique: true });

export default mongoose.model('Vendor', vendorSchema);
