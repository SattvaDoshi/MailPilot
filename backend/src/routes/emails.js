// src/routes/emails.js
import express from 'express';
import {
  sendBulkEmail,
  getCampaignStatus,
  getEmailHistory
} from '../controllers/emailController.js';
import { requireAuth } from '../middleware/auth.js';
import { checkEmailLimit } from '../middleware/subscriptionCheck.js';

const router = express.Router();

router.use(requireAuth);

router.post('/send', checkEmailLimit, sendBulkEmail);
router.get('/campaign/:campaignId', getCampaignStatus);
router.get('/history', getEmailHistory);

export default router;
