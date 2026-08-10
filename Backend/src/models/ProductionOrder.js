import mongoose from 'mongoose';

const productionOrderSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    bomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BOM',
      required: true,
    },
    finishedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    plannedQty: {
      type: Number,
      required: true,
    },
    producedQty: {
      type: Number,
      default: 0,
    },
    scrapQty: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    assignedMachines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
      },
    ],
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    materialsDeducted: {
      type: Boolean,
      default: false,
    },
    costCalculation: {
      materialCost: { type: Number, default: 0 },
      overheadCost: { type: Number, default: 0 },
      totalProductionCost: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

productionOrderSchema.index({ tenantId: 1, orderNumber: 1 }, { unique: true });

export default mongoose.model('ProductionOrder', productionOrderSchema);
