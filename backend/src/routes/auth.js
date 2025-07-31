// src/routes/auth.js
import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  getUserProfile,
  logout
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/logout', logout);

// Protected routes
router.use(requireAuth);
router.get('/profile', getUserProfile);

export default router;
