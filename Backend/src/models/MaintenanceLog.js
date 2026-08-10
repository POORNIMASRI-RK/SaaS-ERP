import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    logNumber: {
      type: String,
      required: true,
    },
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
    },
    type: {
      type: String,
      enum: ['preventive', 'corrective', 'breakdown'],
      required: true,
    },
    problemDescription: {
      type: String,
      required: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    completionDate: {
      type: Date,
      default: null,
    },
    sparePartsUsed: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
        },
        quantity: Number,
      },
    ],
    maintenanceCost: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed'],
      default: 'scheduled',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

maintenanceLogSchema.index({ tenantId: 1, logNumber: 1 }, { unique: true });

export default mongoose.model('MaintenanceLog', maintenanceLogSchema);
