import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveRequest',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'leave_applied',
        'leave_manager_approved',
        'leave_hr_approved',
        'leave_rejected',
        'user_invited',
        'system',
        'pr_approval',
        'pr_approved',
        'pr_rejected',
        'po_created',
        'po_approved',
        'production_order',
        'stock_low',
        'sales_order',
        'quotation',
        'maintenance',
        'payroll',
        'general',
      ],
      default: 'system',
    },
    link: {
      type: String,
      default: '/hrms',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
