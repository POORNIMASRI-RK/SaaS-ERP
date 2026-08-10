import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    machineCode: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'CNC Milling',
    },
    model: {
      type: String,
      default: '',
    },
    serialNumber: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Shopfloor Line 1',
    },
    status: {
      type: String,
      enum: ['operational', 'under_maintenance', 'breakdown'],
      default: 'operational',
    },
    lastServiceDate: {
      type: Date,
      default: null,
    },
    nextServiceDate: {
      type: Date,
      default: null,
    },
    totalDowntimeHours: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

machineSchema.index({ tenantId: 1, machineCode: 1 }, { unique: true });

export default mongoose.model('Machine', machineSchema);
