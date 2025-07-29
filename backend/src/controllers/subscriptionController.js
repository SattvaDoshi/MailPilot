// src/controllers/subscriptionController.js
import subscriptionService from '../services/subscriptionService.js';
import { SUBSCRIPTION_LIMITS } from '../utils/constants.js';
import Joi from 'joi';

const createSubscriptionSchema = Joi.object({
  planType: Joi.string().valid('basic', 'premium', 'unlimited').required()
});

const verifyPaymentSchema = Joi.object({
  paymentId: Joi.string().required(),
  orderId: Joi.string().required(),
  signature: Joi.string().required(),
  planType: Joi.string().valid('basic', 'premium', 'unlimited').required()
});

export const getPlans = async (req, res) => {
  try {
    const plans = Object.entries(SUBSCRIPTION_LIMITS).map(([key, value]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      price: value.price,
      emailLimit: value.emailLimit === -1 ? 'Unlimited' : value.emailLimit,
      groupLimit: value.groupLimit === -1 ? 'Unlimited' : value.groupLimit,
      features: getPlanFeatures(key)
    }));

    res.json({ plans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const { error, value } = createSubscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { planType } = value;
    const order = await subscriptionService.createSubscription(req.user.sub, planType);

    res.json({
      message: 'Subscription order created successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { error, value } = verifyPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { paymentId, orderId, signature, planType } = value;
    
    const result = await subscriptionService.verifyPayment(
      paymentId,
      orderId,
      signature,
      req.user.sub,
      planType
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const status = await subscriptionService.getSubscriptionStatus(req.user.sub);
    res.json({ subscription: status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const result = await subscriptionService.cancelSubscription(req.user.sub);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPlanFeatures = (planType) => {
  const features = {
    free: [
      'Send up to 20 emails',
      'Create up to 2 contact groups',
      'Basic email templates',
      'Email delivery tracking'
    ],
    basic: [
      'Send up to 100 emails',
      'Create up to 5 contact groups',
      'AI-powered email templates',
      'Advanced analytics',
      'Priority support'
    ],
    premium: [
      'Send up to 500 emails',
      'Create up to 15 contact groups',
      'AI-powered email templates',
      'Advanced analytics',
      'Custom email domains',
      'Priority support'
    ],
    unlimited: [
      'Unlimited emails',
      'Unlimited contact groups',
      'AI-powered email templates',
      'Advanced analytics',
      'Custom email domains',
      'White-label solution',
      'Dedicated support'
    ]
  };

  return features[planType] || [];
};
