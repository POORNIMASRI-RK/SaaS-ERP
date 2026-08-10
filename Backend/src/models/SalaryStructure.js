import mongoose from 'mongoose';

const salaryStructureSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    basicPercent: {
      type: Number,
      default: 50, // 50% of CTC
    },
    hraPercent: {
      type: Number,
      default: 20, // 20% of CTC
    },
    daPercent: {
      type: Number,
      default: 10, // 10% of CTC
    },
    conveyanceAllowance: {
      type: Number,
      default: 1600,
    },
    medicalAllowance: {
      type: Number,
      default: 1250,
    },
    specialAllowancePercent: {
      type: Number,
      default: 20,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('SalaryStructure', salaryStructureSchema);
