import mongoose from 'mongoose';

const hrmsConfigSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      unique: true,
    },
    isConfigured: {
      type: Boolean,
      default: false,
    },
    organizationName: {
      type: String,
      default: '',
    },
    branchLocations: [
      {
        name: String,
        address: String,
        city: String,
      },
    ],
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    workingHours: {
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:30' },
    },
    weeklyOffs: {
      type: [String],
      default: ['Sunday'],
    },
    lateGracePeriodMinutes: {
      type: Number,
      default: 15,
    },
    overtimeThresholdHours: {
      type: Number,
      default: 8,
    },
    requireMedicalAttachmentDays: {
      type: Number,
      default: 2,
    },
    compOffRules: {
      enableAutoCredit: { type: Boolean, default: true },
      validityDays: { type: Number, default: 90 },
      workThresholdHours: { type: Number, default: 4 },
    },
    approvalWorkflow: {
      requireManagerApproval: { type: Boolean, default: true },
      requireHrApproval: { type: Boolean, default: true },
    },
    holidayCalendar: [
      {
        name: String,
        date: Date,
        isOptional: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('HrmsConfig', hrmsConfigSchema);
