import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    halfDaySession: {
      type: String,
      enum: ['First Half', 'Second Half', 'N/A'],
      default: 'N/A',
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    attachmentUrl: {
      type: String,
      default: '',
    },

    // Approval Workflow Statuses
    managerStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    managerApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    managerComment: {
      type: String,
      default: '',
    },
    managerApprovedAt: {
      type: Date,
    },

    hrStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    hrApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    hrComment: {
      type: String,
      default: '',
    },
    hrApprovedAt: {
      type: Date,
    },

    finalStatus: {
      type: String,
      enum: ['pending_manager', 'pending_hr', 'approved', 'rejected', 'cancelled'],
      default: 'pending_manager',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('LeaveRequest', leaveRequestSchema);
