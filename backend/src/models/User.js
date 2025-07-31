// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const smtpConfigSchema = new mongoose.Schema({
  host: { type: String, required: true, default: 'smtp.gmail.com' },
  port: { type: Number, required: true, default: 587 },
  secure: { type: Boolean, default: false },
  user: { type: String, required: true },
  pass: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  provider: { type: String, enum: ['gmail', 'outlook', 'yahoo', 'custom'], default: 'gmail' }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: String,
  lastName: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  subscription: {
    type: String,
    enum: ['free', 'basic', 'premium', 'unlimited'],
    default: 'free'
  },
  emailsUsedThisMonth: { type: Number, default: 0 },
  groupsCreated: { type: Number, default: 0 },
  subscriptionExpiry: Date,
  razorpayCustomerId: String,
  smtpConfig: smtpConfigSchema,
  defaultFromAddress: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
