import mongoose from 'mongoose';

const creditNoteSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    creditNoteNumber: {
      type: String,
      required: true, // e.g. "CN-2026-001"
    },
    creditNoteDate: {
      type: Date,
      default: Date.now,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GSTInvoice',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    reason: {
      type: String,
      enum: ['Product Return', 'Damaged Goods', 'Pricing Error', 'Discount Adjustment', 'Other'],
      default: 'Product Return',
    },
    returnedItems: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        qtyReturned: Number,
        refundAmount: Number,
        gstRefund: Number,
      },
    ],
    subTotalRefund: { type: Number, required: true },
    gstRefundTotal: { type: Number, required: true },
    totalRefundAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['issued', 'refunded', 'adjusted'],
      default: 'issued',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('CreditNote', creditNoteSchema);
