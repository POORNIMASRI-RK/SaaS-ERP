import mongoose from 'mongoose';

const payrollConfigSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      unique: true,
    },
    payrollCycle: {
      type: String,
      enum: ['monthly', 'bi-weekly', 'weekly'],
      default: 'monthly',
    },
    paymentDay: {
      type: Number,
      default: 30, // 30th of the month or last day
    },
    standardWorkingDays: {
      type: Number,
      default: 26,
    },
    overtimeRateMultiplier: {
      type: Number,
      default: 1.5, // 1.5x hourly rate
    },
    enablePf: {
      type: Boolean,
      default: true,
    },
    pfEmployeeRate: {
      type: Number,
      default: 12, // 12% of basic
    },
    pfCapLimit: {
      type: Number,
      default: 15000, // Statutory monthly basic cap for PF
    },
    enableEsi: {
      type: Boolean,
      default: true,
    },
    esiEmployeeRate: {
      type: Number,
      default: 0.75, // 0.75% of gross
    },
    esiGrossLimit: {
      type: Number,
      default: 21000, // Applicable if gross <= 21,000
    },
    enablePt: {
      type: Boolean,
      default: true,
    },
    enableTds: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('PayrollConfig', payrollConfigSchema);
