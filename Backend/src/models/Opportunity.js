import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    opportunityCode: {
      type: String,
      default: '',
    },
    opportunityName: {
      type: String,
      required: true, // e.g. "Tata Motors 500x Transmission Drive Shaft Supply"
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    stage: {
      type: String,
      enum: ['Qualification', 'Value Proposition', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
      default: 'Qualification',
    },
    dealValue: {
      type: Number,
      required: true,
    },
    probabilityPercent: {
      type: Number,
      default: 50,
    },
    expectedCloseDate: {
      type: Date,
      required: true,
    },
    activities: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Opportunity', opportunitySchema);
