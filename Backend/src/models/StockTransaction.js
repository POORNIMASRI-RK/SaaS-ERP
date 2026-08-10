import mongoose from 'mongoose';

const stockTransactionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    transactionType: {
      type: String,
      enum: [
        'Stock In',
        'Stock Out',
        'Transfer',
        'Adjustment',
        'GRN',
        'Production Issue',
        'Production Output',
        'Invoice',
        'Sales Order',
        'Dispatch',
        'Return',
        'stock_receiving',
        'stock_issue',
        'production_consumption',
        'stock_transfer',
        'stock_adjustment',
        'stock_in',
        'stock_out',
        'stock_receiving_qc',
        'inventory_receiving',
        'STOCK_RECEIVING',
        'STOCK_ISSUE',
        'PRODUCTION_CONSUMPTION',
        'DISPATCH',
      ],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: false,
    },
    targetWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
    },
    batchNo: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    unitCost: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    referenceNo: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('StockTransaction', stockTransactionSchema);
