// src/models/User.js
import mongoose from 'mongoose';

const smtpConfigSchema = new mongoose.Schema({
  host: {
    type: String,
    required: true,
    default: 'smtp.gmail.com'
  },
  port: {
    type: Number,
    required: true,
    default: 587
  },
  secure: {
    type: Boolean,
    default: false
  },
  user: {
    type: String,
    required: true
  },
  pass: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  provider: {
    type: String,
    enum: ['gmail', 'outlook', 'yahoo', 'custom'],
    default: 'gmail'
  }
});

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  subscription: {
    type: String,
    enum: ['free', 'basic', 'premium', 'unlimited'],
    default: 'free'
  },
  emailsUsedThisMonth: {
    type: Number,
    default: 0
  },
  groupsCreated: {
    type: Number,
    default: 0
  },
  subscriptionExpiry: Date,
  razorpayCustomerId: String,
  
  // Add SMTP configuration
  smtpConfig: smtpConfigSchema,
  
  // Default from address for emails
  defaultFromAddress: String
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
