import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    leadCode: {
      type: String,
      required: true, // e.g. "LEAD-2026-001"
    },
    companyName: {
      type: String,
      required: [true, 'Company / Lead name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['Website', 'Exhibition', 'Cold Call', 'Referral', 'Social Media', 'Other'],
      default: 'Website',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    industry: {
      type: String,
      default: 'Automotive & Heavy Manufacturing',
    },
    requirement: {
      type: String,
      default: '',
    },
    estimatedValue: {
      type: Number,
      default: 100000,
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
    },
    city: {
      type: String,
      default: 'Chennai',
    },
    notes: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    convertedToCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    convertedToOpportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Lead', leadSchema);
