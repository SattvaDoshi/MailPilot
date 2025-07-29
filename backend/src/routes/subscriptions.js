// src/routes/subscriptions.js
import express from 'express';
import {
  createSubscription,
  verifyPayment,
  getSubscriptionStatus,
  cancelSubscription,
  getPlans
} from '../controllers/subscriptionController.js';
// Correct import path
import { requireAuth } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/plans', getPlans);

router.use(requireAuth);

router.get('/status', getSubscriptionStatus);
router.post('/create', paymentLimiter, createSubscription);
router.post('/verify', paymentLimiter, verifyPayment);
router.post('/cancel', cancelSubscription);

export default router;
