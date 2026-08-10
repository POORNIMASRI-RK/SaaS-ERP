import mongoose from 'mongoose';

const bomSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    bomNumber: {
      type: String,
      required: true,
    },
    finishedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    finishedQty: {
      type: Number,
      default: 1,
    },
    components: [
      {
        rawItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          required: true,
        },
        quantityRequired: {
          type: Number,
          required: true,
        },
        wastagePercent: {
          type: Number,
          default: 0,
        },
      },
    ],
    estimatedMaterialCost: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

bomSchema.index({ tenantId: 1, bomNumber: 1 }, { unique: true });

export default mongoose.model('BOM', bomSchema);
