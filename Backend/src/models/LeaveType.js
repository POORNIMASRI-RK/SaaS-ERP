import mongoose from 'mongoose';

const leaveTypeSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    daysPerYear: {
      type: Number,
      required: true,
      default: 12,
    },
    maxMonthlyLimit: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    maxConsecutiveDays: {
      type: Number,
      default: 0,
    },
    allowHalfDay: {
      type: Boolean,
      default: true,
    },
    requireAttachmentDays: {
      type: Number,
      default: 0,
    },
    allowCarryForward: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('LeaveType', leaveTypeSchema);
