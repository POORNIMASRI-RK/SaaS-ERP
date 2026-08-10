import mongoose from 'mongoose';

const revisionSchema = new mongoose.Schema({
  previousCtc: Number,
  newCtc: Number,
  revisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  effectiveDate: { type: Date, default: Date.now },
});

const employeeSalarySchema = new mongoose.Schema(
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
      unique: true,
    },
    salaryStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
    },
    annualCtc: {
      type: Number,
      required: true,
    },
    monthlyCtc: {
      type: Number,
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    hra: {
      type: Number,
      default: 0,
    },
    da: {
      type: Number,
      default: 0,
    },
    conveyance: {
      type: Number,
      default: 0,
    },
    medicalAllowance: {
      type: Number,
      default: 0,
    },
    specialAllowance: {
      type: Number,
      default: 0,
    },
    bankAccountNumber: {
      type: String,
      default: '',
    },
    bankIfscCode: {
      type: String,
      default: '',
    },
    bankName: {
      type: String,
      default: '',
    },
    panNumber: {
      type: String,
      default: '',
    },
    pfUanNumber: {
      type: String,
      default: '',
    },
    esiNumber: {
      type: String,
      default: '',
    },
    revisionHistory: [revisionSchema],
  },
  { timestamps: true }
);

export default mongoose.model('EmployeeSalary', employeeSalarySchema);
