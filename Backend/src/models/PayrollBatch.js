import mongoose from 'mongoose';

const payrollBatchSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    batchName: {
      type: String,
      required: true, // e.g. "August 2026 Payroll Run"
    },
    month: {
      type: Number, // 1 to 12
      required: true,
    },
    year: {
      type: Number, // e.g. 2026
      required: true,
    },
    totalEmployees: {
      type: Number,
      default: 0,
    },
    totalGrossSalary: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    totalNetSalary: {
      type: Number,
      default: 0,
    },
    totalOvertimeCost: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'processed', 'approved', 'paid'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paymentDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('PayrollBatch', payrollBatchSchema);
