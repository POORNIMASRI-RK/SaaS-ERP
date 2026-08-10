import mongoose from 'mongoose';

const grnSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    grnNumber: {
      type: String,
      required: true,
    },
    poId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    receivedItems: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          required: true,
        },
        qtyReceived: Number,
        qtyAccepted: Number,
        qtyRejected: Number,
        batchNo: String,
        expiryDate: Date,
        rejectionReason: String,
      },
    ],
    qualityStatus: {
      type: String,
      enum: ['pending_qc', 'passed', 'failed', 'partially_passed'],
      default: 'pending_qc',
    },
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    qcNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

grnSchema.index({ tenantId: 1, grnNumber: 1 }, { unique: true });

export default mongoose.model('GRN', grnSchema);
