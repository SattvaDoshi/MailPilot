import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const router = express.Router();

router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.get('X-Razorpay-Signature');
    const body = JSON.stringify(req.body);
    
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    if (signature === expectedSignature) {
      const { event, payload } = req.body;
      
      switch (event) {
        case 'subscription.charged':
          // Handle successful payment
          await handleSubscriptionCharged(payload.subscription.entity);
          break;
        case 'subscription.cancelled':
          // Handle cancellation
          await handleSubscriptionCancelled(payload.subscription.entity);
          break;
        case 'subscription.completed':
          // Handle completion
          await handleSubscriptionCompleted(payload.subscription.entity);
          break;
      }
      
      res.json({ status: 'ok' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

const handleSubscriptionCharged = async (subscriptionData) => {
  const subscription = await Subscription.findOne({
    razorpaySubscriptionId: subscriptionData.id
  });
  
  if (subscription) {
    subscription.isActive = true;
    subscription.endDate = new Date(subscriptionData.current_end * 1000);
    await subscription.save();
  }
};

const handleSubscriptionCancelled = async (subscriptionData) => {
  const subscription = await Subscription.findOne({
    razorpaySubscriptionId: subscriptionData.id
  });
  
  if (subscription) {
    subscription.isActive = false;
    subscription.cancelledAt = new Date();
    await subscription.save();
  }
};

export default router;
