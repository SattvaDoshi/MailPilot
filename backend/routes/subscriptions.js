import express from 'express';
import { 
  getPlans, 
  createSubscription, 
  verifyPayment, 
  getCurrentSubscription 
} from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/plans', getPlans);
router.post('/create', authenticate, createSubscription);
router.post('/verify', authenticate, verifyPayment);
router.get('/current', authenticate, getCurrentSubscription);

export default router;
