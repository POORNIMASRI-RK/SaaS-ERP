import mongoose from 'mongoose';

const qrCodeLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    qrPayload: {
      type: String,
      required: true, // Unique QR String / Hash e.g. "QR-APEX-FG-SHF-900-BATCH-20260807"
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    batchNumber: {
      type: String,
      default: 'BATCH-2026-001',
    },
    actionType: {
      type: String,
      enum: ['STOCK_RECEIVING', 'STOCK_ISSUE', 'WAREHOUSE_TRANSFER', 'PRODUCTION_CONSUMPTION', 'DISPATCH'],
      required: true,
    },
    qtyScanned: {
      type: Number,
      required: true,
    },
    sourceLocation: {
      type: String,
      default: 'Main Receiving Dock',
    },
    destinationLocation: {
      type: String,
      default: 'Rack A-14 Shopfloor',
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    scannedByName: {
      type: String,
      default: 'Inventory Operator',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('QRCodeLog', qrCodeLogSchema);
