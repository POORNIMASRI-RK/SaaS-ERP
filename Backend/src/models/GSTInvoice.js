import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  name: { type: String, required: true },
  itemCode: { type: String },
  hsnCode: { type: String, default: '8471' },
  uom: { type: String, default: 'Pcs' },
  qty: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0 },
  taxableAmount: { type: Number, required: true },
  gstRate: { type: Number, default: 18 }, // Percentage e.g. 18
  cgstRate: { type: Number, default: 9 },
  cgstAmount: { type: Number, default: 0 },
  sgstRate: { type: Number, default: 9 },
  sgstAmount: { type: Number, default: 0 },
  igstRate: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
});

const gstInvoiceSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true, // e.g., "INV-2026-1001"
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    sellerState: {
      type: String,
      default: 'Tamil Nadu',
    },
    placeOfSupply: {
      type: String,
      required: true, // State name of customer
    },
    isInterState: {
      type: Boolean,
      default: false, // true -> IGST, false -> CGST + SGST
    },
    items: [invoiceItemSchema],
    subTotal: {
      type: Number,
      required: true,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    totalTaxableAmount: {
      type: Number,
      required: true,
    },
    cgstTotal: {
      type: Number,
      default: 0,
    },
    sgstTotal: {
      type: Number,
      default: 0,
    },
    igstTotal: {
      type: Number,
      default: 0,
    },
    totalTaxAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partially_paid', 'paid', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: 'Thank you for your business!',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('GSTInvoice', gstInvoiceSchema);
