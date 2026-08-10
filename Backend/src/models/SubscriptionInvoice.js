import mongoose from 'mongoose';

const subscriptionInvoiceSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true, // e.g., "SUB-2026-101"
    },
    planName: {
      type: String,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'yearly',
    },
    amount: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      default: 'Corporate Credit Card / Net Banking',
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SubscriptionInvoice', subscriptionInvoiceSchema);
