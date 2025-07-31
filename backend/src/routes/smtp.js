// src/routes/smtp.js
import express from 'express';
import {
  configureSmtp,
  getSmtpConfig,
  testSmtpConfig
} from '../controllers/smtpController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/config', getSmtpConfig);
router.post('/config', configureSmtp);
router.post('/test', testSmtpConfig);

export default router;
