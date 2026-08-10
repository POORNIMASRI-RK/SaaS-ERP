import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    poNumber: {
      type: String,
      required: true,
    },
    prId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseRequest',
      default: null,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        taxRate: {
          type: Number,
          default: 18, // 18% GST
        },
        totalCost: {
          type: Number,
          required: true,
        },
      },
    ],
    subTotal: {
      type: Number,
      required: true,
    },
    taxTotal: {
      type: Number,
      required: true,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    expectedDeliveryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['issued', 'partially_received', 'received', 'cancelled'],
      default: 'issued',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ tenantId: 1, poNumber: 1 }, { unique: true });

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
