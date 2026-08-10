import mongoose from 'mongoose';

const quoteItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  name: { type: String, required: true },
  hsnCode: { type: String, default: '8471' },
  uom: { type: String, default: 'Pcs' },
  qty: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  stockAvailable: { type: Number, default: 0 },
  shortageQty: { type: Number, default: 0 },
  estProductionRequirement: { type: String, default: 'In Stock' },
});

const quotationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    quoteNumber: {
      type: String,
      required: true, // e.g. "QT-2026-101"
    },
    quoteDate: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
    },
    items: [quoteItemSchema],
    subTotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'converted'],
      default: 'draft',
    },
    termsAndConditions: {
      type: String,
      default: '1. Price valid for 30 days. 2. Delivery within 14 working days from Purchase Order signoff.',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Quotation', quotationSchema);
