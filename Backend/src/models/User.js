import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = [
  'Super Admin',
  'Company Admin',
  'Sales Manager',
  'Sales Executive',
  'CRM Employee',
  'Purchase Manager',
  'Purchase Employee',
  'Inventory Manager',
  'Inventory Employee',
  'Warehouse Manager',
  'Warehouse Employee',
  'Production Manager',
  'Production Employee',
  'Maintenance Manager',
  'Maintenance Employee',
  'Finance Manager',
  'Finance Employee',
  'HR',
  'Manager',
  'Team Leader',
];

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      required: [true, 'User role is required'],
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: function () {
        return this.role !== 'Super Admin';
      },
    },
    department: {
      type: String,
      default: 'General Assembly',
      trim: true,
    },
    designation: {
      type: String,
      default: 'Staff',
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    branchLocation: {
      type: String,
      default: 'Main Manufacturing Plant',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending_invitation'],
      default: 'active',
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
export { ROLES };
