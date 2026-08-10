import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    itemCode: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    itemGroup: {
      type: String,
      default: 'Default',
    },
    itemType: {
      type: String,
      enum: ['Raw Material', 'Semi-Finished', 'Finished Goods', 'Consumable', 'Spare Part'],
      required: true,
      default: 'Raw Material',
    },
    uom: {
      type: String,
      required: true,
      default: 'Pcs',
    },
    barcode: {
      type: String,
      default: '',
    },
    qrCode: {
      type: String,
      default: '',
    },
    batchNo: {
      type: String,
      default: 'BATCH-2026-001',
    },
    warehouseLocation: {
      type: String,
      default: 'Rack A-12 Main Warehouse',
    },
    minStockLevel: {
      type: Number,
      default: 10,
    },
    reorderLevel: {
      type: Number,
      default: 25,
    },
    reorderQty: {
      type: Number,
      default: 100,
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    valuationMethod: {
      type: String,
      enum: ['FIFO', 'WAVG'],
      default: 'FIFO',
    },
    totalStock: {
      type: Number,
      default: 0,
    },
    batchLotTracking: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

itemSchema.index({ tenantId: 1, itemCode: 1 }, { unique: true });

export default mongoose.model('Item', itemSchema);
