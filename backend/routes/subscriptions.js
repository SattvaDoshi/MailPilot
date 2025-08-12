import express from 'express';
import { 
  getPlans, 
  createSubscription, 
  verifySubscription,
  cancelSubscription,
  changeSubscriptionPlan, 
  getCurrentSubscription,
  getSubscriptionStatus
} from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/plans', getPlans);
router.post('/create', authenticate, createSubscription);
router.post('/verify', authenticate, verifySubscription);
router.post('/cancel', authenticate, cancelSubscription);
router.post('/change-plan', authenticate, changeSubscriptionPlan);
router.get('/current', authenticate, getCurrentSubscription);
router.get('/status', authenticate, getSubscriptionStatus);

export default router;
