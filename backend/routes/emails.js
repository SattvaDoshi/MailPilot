import express from 'express';
import { 
  sendEmails, 
  getEmailStatus, 
  getEmailHistory, 
  getEmailAnalytics 
} from '../controllers/emailController.js';
import { authenticate } from '../middleware/auth.js';
import { emailSendingLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/send', authenticate, emailSendingLimiter, sendEmails);
router.get('/status/:id', authenticate, getEmailStatus);
router.get('/history', authenticate, getEmailHistory);
router.get('/analytics', authenticate, getEmailAnalytics);

export default router;
