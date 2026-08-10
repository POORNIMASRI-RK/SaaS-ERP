import mongoose from 'mongoose';

const purchaseRequestSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    prNumber: {
      type: String,
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: String,
      default: 'Production',
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          required: true,
        },
        requestedQty: {
          type: Number,
          required: true,
        },
        estimatedUnitPrice: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalEstimatedCost: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'rejected', 'po_generated'],
      default: 'pending_approval',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

purchaseRequestSchema.index({ tenantId: 1, prNumber: 1 }, { unique: true });

export default mongoose.model('PurchaseRequest', purchaseRequestSchema);
