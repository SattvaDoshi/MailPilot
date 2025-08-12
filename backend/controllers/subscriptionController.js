import crypto from 'crypto';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Razorpay from 'razorpay'

// Don't initialize Razorpay at module level
let razorpay = null;

// Initialize Razorpay instance when needed
const getRazorpayInstance = () => {
  if (!razorpay) {
    
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
  basic: { 
    price: 199, 
    emailLimit: 100, 
    groupLimit: 5,
    planId: process.env.RAZORPAY_BASIC_PLAN_ID // Use predefined plan ID
  },
  pro: { 
    price: 399, 
    emailLimit: 500, 
    groupLimit: 10,
    planId: process.env.RAZORPAY_PRO_PLAN_ID // Use predefined plan ID
  },
  unlimited: { 
    price: 799, 
    emailLimit: -1, 
    groupLimit: -1,
    planId: process.env.RAZORPAY_UNLIMITED_PLAN_ID // Use predefined plan ID
  }
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

// Create Razorpay Plan (call this once for each plan type)
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

    if (!planDetails.planId) {
      return res.status(500).json({
        success: false,
        message: `Plan ID not configured for ${plan} plan`
      });
    }

    console.log(`Creating subscription for plan: ${plan}, Plan ID: ${planDetails.planId}`);

    const razorpayInstance = getRazorpayInstance();
    
    const subscriptionData = {
      plan_id: planDetails.planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 months
      // Remove start_at to make it start immediately
      // start_at: Math.floor(Date.now() / 1000) + 300, // ❌ Remove this line
      notes: {
        userId: user._id.toString(),
        planType: plan,
        userEmail: user.email
      }
    };

    console.log('Creating Razorpay subscription with data:', subscriptionData);

    const subscription = await razorpayInstance.subscriptions.create(subscriptionData);
    
    console.log('Razorpay subscription created:', subscription);

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        shortUrl: subscription.short_url,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Razorpay subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const verifySubscription = async (req, res) => {
  try {
    const { 
      razorpay_subscription_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan // This might be empty from frontend
    } = req.body;

    // If plan is empty, try to get it from Razorpay subscription
    let actualPlan = plan;
    
    if (!actualPlan || actualPlan === '') {
      console.log('Plan is empty, fetching from Razorpay subscription...');
      
      try {
        const razorpayInstance = getRazorpayInstance();
        const razorpaySubscription = await razorpayInstance.subscriptions.fetch(razorpay_subscription_id);
        
        actualPlan = razorpaySubscription.notes.planType;
        console.log('Retrieved plan from Razorpay notes:', actualPlan);
      } catch (fetchError) {
        console.error('Failed to fetch subscription from Razorpay:', fetchError);
      }
    }

    console.log('Using plan for verification:', actualPlan);

    // Verify signature (your existing code)
    const text = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[actualPlan]; // Use actualPlan instead of plan

    if (!planDetails) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan: ${actualPlan}` // Better error message
      });
    }

    // Rest of your verification logic remains the same...
    const user = await User.findById(req.userId);
    let subscription = await Subscription.findOne({ user: req.userId });
    
    if (!subscription) {
      subscription = new Subscription({ user: req.userId });
    }

    subscription.plan = actualPlan; // Use actualPlan
    subscription.emailLimit = planDetails.emailLimit;
    subscription.groupLimit = planDetails.groupLimit;
    subscription.price = planDetails.price;
    subscription.isActive = true;
    subscription.startDate = new Date();
    subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    subscription.razorpaySubscriptionId = razorpay_subscription_id;
    subscription.razorpayPaymentId = razorpay_payment_id;
    subscription.razorpayPlanId = planDetails.planId;

    await subscription.save();

    user.subscription = subscription._id;
    user.emailsSentThisMonth = 0;
    user.lastEmailReset = new Date();
    await user.save();

    console.log('✅ Subscription activated successfully for user:', user.email);

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Subscription verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const changeSubscriptionPlan = async (req, res) => {
  try {
    const { newPlan } = req.body;
    
    console.log('Plan change request (cancel-then-create):', { newPlan, userId: req.userId });
    
    if (!SUBSCRIPTION_PLANS[newPlan] && newPlan !== 'free') {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
    }

    const user = await User.findById(req.userId).populate('subscription');
    
    if (!user.subscription) {
      return res.status(400).json({
        success: false,
        message: 'No subscription found'
      });
    }

    const currentSubscription = user.subscription;
    console.log('Current subscription state:', {
      plan: currentSubscription.plan,
      isActive: currentSubscription.isActive,
      razorpaySubscriptionId: currentSubscription.razorpaySubscriptionId
    });

    // ✅ STEP 1: Always cancel current subscription first (if it's active/paid)
    if (currentSubscription.isActive && currentSubscription.razorpaySubscriptionId) {
      console.log('🔄 Step 1: Cancelling current subscription...');
      
      try {
        const razorpayInstance = getRazorpayInstance();
        await razorpayInstance.subscriptions.cancel(
          currentSubscription.razorpaySubscriptionId,
          { cancel_at_cycle_end: false } // Cancel immediately
        );
        console.log('✅ Current Razorpay subscription cancelled');
      } catch (cancelError) {
        console.log('⚠️ Razorpay cancellation failed:', cancelError.message);
        // Continue even if Razorpay cancellation fails
      }
    }

    // ✅ STEP 2: Always revert current subscription to free state
    console.log('🔄 Step 2: Reverting to free plan state...');
    currentSubscription.plan = 'free';
    currentSubscription.emailLimit = 20;
    currentSubscription.groupLimit = 2;
    currentSubscription.price = 0;
    currentSubscription.isActive = false;
    currentSubscription.cancelledAt = new Date();
    currentSubscription.razorpaySubscriptionId = null;
    currentSubscription.razorpayPaymentId = null;
    currentSubscription.razorpayPlanId = null;
    
    await currentSubscription.save();
    console.log('✅ Subscription reverted to free state');

    // ✅ STEP 3: If new plan is free, we're done
    if (newPlan === 'free') {
      console.log('✅ Plan change completed - staying on free plan');
      return res.json({
        success: true,
        message: 'Successfully changed to free plan',
        data: currentSubscription,
        requiresPayment: false
      });
    }

    // ✅ STEP 4: Create new subscription for paid plans
    console.log('🔄 Step 3: Creating new subscription for paid plan...');
    
    const newPlanDetails = SUBSCRIPTION_PLANS[newPlan];
    const razorpayInstance = getRazorpayInstance();
    
    const subscriptionData = {
      plan_id: newPlanDetails.planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 12,
      notes: {
        userId: user._id.toString(),
        planType: newPlan,
        userEmail: user.email,
        changedFrom: currentSubscription.plan,
        changeTimestamp: new Date().toISOString()
      }
    };

    const razorpaySubscription = await razorpayInstance.subscriptions.create(subscriptionData);
    
    console.log('✅ New Razorpay subscription created:', razorpaySubscription.id);
    
    return res.json({
      success: true,
      message: `Current plan cancelled. Complete payment to activate ${newPlan} plan.`,
      data: {
        subscriptionId: razorpaySubscription.id,
        shortUrl: razorpaySubscription.short_url,
        key: process.env.RAZORPAY_KEY_ID,
        requiresPayment: true, // ✅ Always requires payment for paid plans
        planType: newPlan,
        amount: newPlanDetails.price,
        cancelledPlan: currentSubscription.plan
      }
    });

  } catch (error) {
    console.error('❌ Change subscription plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('subscription');
    
    if (!user.subscription) {
      return res.status(400).json({
        success: false,
        message: 'No subscription found'
      });
    }

    const { cancelAtCycleEnd = false } = req.body;
    const razorpayInstance = getRazorpayInstance();
    
    // Only try to cancel in Razorpay if there's an active Razorpay subscription
    if (user.subscription.razorpaySubscriptionId && user.subscription.isActive) {
      try {
        await razorpayInstance.subscriptions.cancel(
          user.subscription.razorpaySubscriptionId,
          {
            cancel_at_cycle_end: cancelAtCycleEnd
          }
        );
        console.log('✅ Razorpay subscription cancelled successfully');
      } catch (razorpayError) {
        console.log('⚠️ Razorpay cancellation failed:', razorpayError.message);
        // Continue with local cancellation even if Razorpay fails
      }
    }

    // ✅ ALWAYS update subscription to free plan on cancellation
    const subscription = user.subscription;
    subscription.plan = 'free';                    // Revert to free plan
    subscription.emailLimit = 20;                  // Free plan limits
    subscription.groupLimit = 2;                   // Free plan limits
    subscription.price = 0;                        // Free plan price
    subscription.isActive = false;                 // Set to inactive
    subscription.cancelledAt = new Date();
    subscription.cancelAtCycleEnd = cancelAtCycleEnd;
    subscription.razorpaySubscriptionId = null;    // Clear Razorpay references
    subscription.razorpayPaymentId = null;
    subscription.razorpayPlanId = null;
    
    await subscription.save();

    console.log('✅ Subscription reverted to free plan for user:', user.email);

    res.json({
      success: true,
      message: cancelAtCycleEnd 
        ? 'Subscription will be cancelled at the end of current billing cycle and reverted to free plan'
        : 'Subscription cancelled successfully and reverted to free plan',
      data: subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
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

// Get subscription status from Razorpay
export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('subscription');
    
    if (!user.subscription || !user.subscription.razorpaySubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No subscription found'
      });
    }

    const razorpayInstance = getRazorpayInstance();
    const subscriptionStatus = await razorpayInstance.subscriptions.fetch(
      user.subscription.razorpaySubscriptionId
    );

    res.json({
      success: true,
      data: {
        localSubscription: user.subscription,
        razorpayStatus: subscriptionStatus
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
