// src/models/Subscription.js
import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'unlimited'],
    default: 'free'
  },
  razorpaySubscriptionId: String,
  razorpayPaymentId: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  emailLimit: {
    type: Number,
    default: 20
  },
  groupLimit: {
    type: Number,
    default: 2
  }
}, {
  timestamps: true
});

export default mongoose.model('Subscription', subscriptionSchema);
