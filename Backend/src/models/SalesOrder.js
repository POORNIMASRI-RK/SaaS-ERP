import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
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
  reservedQty: { type: Number, default: 0 },
  shortageQty: { type: Number, default: 0 },
});

const salesOrderSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true, // e.g. "SO-2026-501"
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
    },
    items: [orderItemSchema],
    subTotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Confirmed', 'Inventory Checking', 'In Production', 'Ready for Dispatch', 'Dispatched', 'Completed', 'Cancelled', 'confirmed', 'in_production', 'shipped', 'delivered', 'billed'],
      default: 'Confirmed',
    },
    inventoryStatus: {
      type: String,
      enum: ['Reserved', 'Shortage - Sent to Production', 'Released', 'Pending Check'],
      default: 'Pending Check',
    },
    productionOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductionOrder',
    },
    paymentTerms: {
      type: String,
      default: 'Net 30 Days',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('SalesOrder', salesOrderSchema);
