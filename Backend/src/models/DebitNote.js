import mongoose from 'mongoose';

const debitNoteSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    debitNoteNumber: {
      type: String,
      required: true, // e.g. "DN-2026-001"
    },
    debitNoteDate: {
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
      enum: ['Price Correction', 'Additional Freight Charges', 'Late Payment Penalty', 'Other'],
      default: 'Price Correction',
    },
    additionalAmount: { type: Number, required: true },
    gstAdditional: { type: Number, required: true },
    totalDebitAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['issued', 'collected'],
      default: 'issued',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('DebitNote', debitNoteSchema);
