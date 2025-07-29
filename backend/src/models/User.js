// src/models/User.js
import mongoose from 'mongoose';

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
  razorpayCustomerId: String
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
