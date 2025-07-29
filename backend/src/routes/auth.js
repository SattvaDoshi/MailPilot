// src/routes/auth.js
import express from 'express';
import {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deleteUser
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);

router.use(requireAuth);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.delete('/profile', deleteUser);

export default router;
