import mongoose from 'mongoose';

const reimbursementClaimSchema = new mongoose.Schema(
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
    claimType: {
      type: String,
      enum: ['Travel', 'Medical', 'Food', 'Internet & Mobile', 'Production Tools', 'Other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    claimDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ReimbursementClaim', reimbursementClaimSchema);
