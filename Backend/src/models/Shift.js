import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
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
    startTime: {
      type: String,
      required: true, // e.g. "06:00", "09:00", "14:00", "22:00"
    },
    endTime: {
      type: String,
      required: true, // e.g. "14:00", "17:30", "22:00", "06:00"
    },
    breakDurationMinutes: {
      type: Number,
      default: 45,
    },
    gracePeriodMinutes: {
      type: Number,
      default: 15,
    },
    overtimeEligible: {
      type: Boolean,
      default: true,
    },
    colorCode: {
      type: String,
      default: '#2563eb',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Shift', shiftSchema);
