import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'pro', 'unlimited'],
    default: 'free'
  },
  emailLimit: {
    type: Number,
    default: 20
  },
  groupLimit: {
    type: Number,
    default: 2
  },
  price: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  cancelledAt: Date,
  cancelAtCycleEnd: {
    type: Boolean,
    default: false
  },
  razorpaySubscriptionId: String,
  razorpayPaymentId: String,
  razorpayPlanId: String
}, {
  timestamps: true
});

export default mongoose.model('Subscription', subscriptionSchema);
