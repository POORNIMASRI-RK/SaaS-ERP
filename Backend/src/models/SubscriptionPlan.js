import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // e.g. "Basic", "Professional", "Enterprise", "Custom"
    },
    monthlyPrice: {
      type: Number,
      required: true,
    },
    yearlyPrice: {
      type: Number,
      required: true,
    },
    maxUsers: {
      type: Number,
      required: true,
    },
    storageLimitMB: {
      type: Number,
      required: true,
    },
    includedModules: [
      {
        type: String,
      },
    ],
    features: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
