import mongoose from 'mongoose';

const loanAdvanceSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['Loan', 'Salary Advance'],
      default: 'Loan',
    },
    principalAmount: {
      type: Number,
      required: true,
    },
    emiAmount: {
      type: Number,
      required: true,
    },
    tenureMonths: {
      type: Number,
      default: 1,
    },
    remainingBalance: {
      type: Number,
      required: true,
    },
    disbursementDate: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'completed'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('LoanAdvance', loanAdvanceSchema);
