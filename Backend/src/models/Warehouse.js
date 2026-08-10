import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: '',
    },
    capacitySqFt: {
      type: Number,
      default: 5000,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    racks: [
      {
        rackNo: String,
        capacity: Number,
        occupied: Number,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'maintenance', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

warehouseSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export default mongoose.model('Warehouse', warehouseSchema);
