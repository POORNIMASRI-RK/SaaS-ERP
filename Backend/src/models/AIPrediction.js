import mongoose from 'mongoose';

const aiPredictionSettingsSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      unique: true,
    },
    forecastHorizonDays: {
      type: Number,
      default: 30, // 30, 60, or 90 days
    },
    safetyStockBufferDays: {
      type: Number,
      default: 14,
    },
    smoothingFactorAlpha: {
      type: Number,
      default: 0.3, // Holt-Winters exponential smoothing factor
    },
    seasonalityEnabled: {
      type: Boolean,
      default: true,
    },
    autoReorderThresholdPercent: {
      type: Number,
      default: 20, // Alert when stock < 20% of ROP
    },
    confidenceScore: {
      type: Number,
      default: 94.2, // AI Model accuracy %
    },
  },
  { timestamps: true }
);

export default mongoose.model('AIPredictionSettings', aiPredictionSettingsSchema);
