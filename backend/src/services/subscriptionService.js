// src/services/subscriptionService.js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { SUBSCRIPTION_LIMITS, RAZORPAY_PLANS } from '../utils/constants.js';

class SubscriptionService {
  constructor() {
    this.razorpay = null; // Don't initialize immediately
    this.isInitialized = false;
  }

  // Initialize Razorpay when first needed
  initializeRazorpay() {
    if (!this.isInitialized) {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('❌ Razorpay credentials missing in environment variables');
        this.razorpay = null;
      } else {
        this.razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        console.log('✅ Razorpay initialized successfully');
      }
      this.isInitialized = true;
    }
    return this.razorpay;
  }

  async createSubscription(userId, planType) {
    try {
      const razorpay = this.initializeRazorpay(); // Initialize when needed
      
      if (!razorpay) {
        throw new Error('Razorpay not initialized. Please check your environment variables.');
      }

      const user = await User.findOne({ clerkId: userId });
      if (!user) {
        throw new Error('User not found');
      }

      const planDetails = SUBSCRIPTION_LIMITS[planType];
      if (!planDetails) {
        throw new Error('Invalid plan type');
      }

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: planDetails.price * 100,
        currency: 'INR',
        receipt: `order_${userId}_${Date.now()}`,
        notes: {
          userId,
          planType
        }
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planType,
        planDetails
      };
    } catch (error) {
      throw new Error(`Subscription creation failed: ${error.message}`);
    }
  }

  async verifyPayment(paymentId, orderId, signature, userId, planType) {
    try {
      this.initializeRazorpay(); // Ensure Razorpay is initialized
      
      if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay secret key not found');
      }

      // Verify signature
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(orderId + '|' + paymentId);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== signature) {
        throw new Error('Payment verification failed');
      }

      // Update user subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const subscriptionData = {
        userId,
        plan: planType,
        razorpayPaymentId: paymentId,
        status: 'active',
        startDate: new Date(),
        endDate,
        emailLimit: SUBSCRIPTION_LIMITS[planType].emailLimit,
        groupLimit: SUBSCRIPTION_LIMITS[planType].groupLimit
      };

      await Subscription.findOneAndUpdate(
        { userId },
        subscriptionData,
        { upsert: true, new: true }
      );

      await User.findOneAndUpdate(
        { clerkId: userId },
        {
          subscription: planType,
          subscriptionExpiry: endDate,
          emailsUsedThisMonth: 0
        }
      );

      return {
        success: true,
        message: 'Subscription activated successfully',
        planType,
        endDate
      };
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  async getSubscriptionStatus(userId) {
    try {
      const user = await User.findOne({ clerkId: userId });
      const subscription = await Subscription.findOne({ userId });

      if (!user || !subscription) {
        return {
          plan: 'free',
          status: 'active',
          emailsUsed: 0,
          emailLimit: 20,
          groupsUsed: 0,
          groupLimit: 2
        };
      }

      return {
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        emailsUsed: user.emailsUsedThisMonth,
        emailLimit: subscription.emailLimit,
        groupsUsed: user.groupsCreated,
        groupLimit: subscription.groupLimit
      };
    } catch (error) {
      throw new Error(`Failed to get subscription status: ${error.message}`);
    }
  }

  async cancelSubscription(userId) {
    try {
      const subscription = await Subscription.findOne({ userId });
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      await Subscription.findOneAndUpdate(
        { userId },
        {
          status: 'cancelled',
          endDate: new Date()
        }
      );

      await User.findOneAndUpdate(
        { clerkId: userId },
        {
          subscription: 'free',
          subscriptionExpiry: null
        }
      );

      return {
        success: true,
        message: 'Subscription cancelled successfully'
      };
    } catch (error) {
      throw new Error(`Subscription cancellation failed: ${error.message}`);
    }
  }

  async resetMonthlyUsage() {
    try {
      await User.updateMany(
        {},
        { emailsUsedThisMonth: 0 }
      );

      console.log('Monthly usage reset completed');
    } catch (error) {
      throw new Error(`Monthly usage reset failed: ${error.message}`);
    }
  }
}

export default new SubscriptionService();
