import crypto from 'crypto';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

// Don't initialize Razorpay at module level
let razorpay = null;

// Initialize Razorpay instance when needed
const getRazorpayInstance = () => {
  if (!razorpay) {
    // Dynamic import to ensure env vars are loaded
    const Razorpay = require('razorpay');
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not found in environment variables');
    }
    
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

const SUBSCRIPTION_PLANS = {
  basic: { price: 199, emailLimit: 100, groupLimit: 5 },
  pro: { price: 399, emailLimit: 500, groupLimit: 10 },
  unlimited: { price: 799, emailLimit: -1, groupLimit: -1 }
};

export const getPlans = (req, res) => {
  res.json({
    success: true,
    data: {
      free: { price: 0, emailLimit: 20, groupLimit: 2 },
      ...SUBSCRIPTION_PLANS
    }
  });
};

export const createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
    }

    const user = await User.findById(req.userId);
    const planDetails = SUBSCRIPTION_PLANS[plan];

    const options = {
      amount: planDetails.price * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${user._id}_${Date.now()}`,
      notes: {
        userId: user._id,
        plan: plan
      }
    };

    const razorpayInstance = getRazorpayInstance();
    const order = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Razorpay error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan 
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    const user = await User.findById(req.userId);
    const planDetails = SUBSCRIPTION_PLANS[plan];

    // Update or create subscription
    let subscription = await Subscription.findOne({ user: req.userId });
    
    if (!subscription) {
      subscription = new Subscription({ user: req.userId });
    }

    subscription.plan = plan;
    subscription.emailLimit = planDetails.emailLimit;
    subscription.groupLimit = planDetails.groupLimit;
    subscription.price = planDetails.price;
    subscription.isActive = true;
    subscription.startDate = new Date();
    subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    subscription.razorpayPaymentId = razorpay_payment_id;

    await subscription.save();

    // Reset user's monthly email count
    user.emailsSentThisMonth = 0;
    user.lastEmailReset = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      data: subscription
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCurrentSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('subscription');
    
    res.json({
      success: true,
      data: user.subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
