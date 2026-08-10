import mongoose from 'mongoose';

const payrollAuditLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. "SALARY_REVISION", "BATCH_GENERATED", "BATCH_APPROVED", "PAYMENT_MARKED"
    },
    targetEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    details: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('PayrollAuditLog', payrollAuditLogSchema);
