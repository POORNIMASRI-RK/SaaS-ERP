import mongoose from 'mongoose';

const gstSettingsSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      unique: true,
    },
    gstin: {
      type: String,
      uppercase: true,
      default: '33AAACA1001A1Z5',
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
    },
    stateCode: {
      type: String,
      default: '33',
    },
    invoicePrefix: {
      type: String,
      default: 'INV-2026-',
    },
    creditNotePrefix: {
      type: String,
      default: 'CN-2026-',
    },
    debitNotePrefix: {
      type: String,
      default: 'DN-2026-',
    },
    defaultGstRate: {
      type: Number,
      default: 18,
    },
    paymentTerms: {
      type: String,
      default: 'Net 30 Days',
    },
    bankDetails: {
      accountName: { type: String, default: 'Apex Manufacturing Pvt Ltd' },
      accountNumber: { type: String, default: '998877665511' },
      ifscCode: { type: String, default: 'HDFC0004521' },
      bankName: { type: String, default: 'HDFC Industrial Bank' },
      branch: { type: String, default: 'Chennai Industrial City' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('GSTSettings', gstSettingsSchema);
