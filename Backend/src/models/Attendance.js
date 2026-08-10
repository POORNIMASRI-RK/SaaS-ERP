import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
    },
    checkInTime: Date,
    checkOutTime: Date,
    workDurationMinutes: {
      type: Number,
      default: 0,
    },
    overtimeMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'Present',
        'Late Arrival',
        'Early Exit',
        'On Leave',
        'Absent',
        'Half Day',
        'Holiday',
        'Weekly Off',
        'Overtime',
      ],
      default: 'Present',
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    isEarlyExit: {
      type: Boolean,
      default: false,
    },
    biometricDeviceId: {
      type: String,
      default: 'BIO-DEV-DEFAULT',
    },
    isBiometricVerified: {
      type: Boolean,
      default: true,
    },
    isManualCorrection: {
      type: Boolean,
      default: false,
    },
    correctionAuditLog: [
      {
        correctedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        previousStatus: String,
        newStatus: String,
        previousCheckIn: Date,
        newCheckIn: Date,
        previousCheckOut: Date,
        newCheckOut: Date,
        reason: String,
        correctedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Composite unique index: One attendance record per employee per date per tenant
attendanceSchema.index({ tenantId: 1, employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
