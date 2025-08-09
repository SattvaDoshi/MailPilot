import express from 'express';
import { 
  register, 
  login, 
  verifyEmail, 
  setupTwoFactor, 
  verifyTwoFactor 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/setup-2fa', authenticate, setupTwoFactor);
router.post('/verify-2fa', authenticate, verifyTwoFactor);

export default router;
