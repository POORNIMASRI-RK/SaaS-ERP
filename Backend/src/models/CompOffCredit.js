import mongoose from 'mongoose';

const compOffCreditSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workDate: {
      type: Date,
      required: true,
    },
    creditDays: {
      type: Number,
      default: 1.0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'used', 'expired'],
      default: 'available',
    },
    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('CompOffCredit', compOffCreditSchema);
