import mongoose from 'mongoose';

const payrollRecordSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PayrollBatch',
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },

    // Attendance Breakdown
    standardWorkingDays: { type: Number, default: 26 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    paidLeaveDays: { type: Number, default: 0 },
    unpaidLopDays: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },

    // Earnings Breakdown
    basicSalary: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    performanceBonus: { type: Number, default: 0 },
    reimbursements: { type: Number, default: 0 },
    grossSalary: { type: Number, default: 0 },

    // Deductions Breakdown
    pfDeduction: { type: Number, default: 0 },
    esiDeduction: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    tdsTax: { type: Number, default: 0 },
    lopDeduction: { type: Number, default: 0 },
    loanEmiDeduction: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },

    // Final Net Salary
    netSalary: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['draft', 'processed', 'approved', 'paid'],
      default: 'draft',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processed', 'credited'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('PayrollRecord', payrollRecordSchema);
