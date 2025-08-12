import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  updateProfile, 
  changePassword, 
  deleteAccount, 
  getDashboardStats,
  getUserProfile,
  getUserStats,
  testSMTPSettings
} from '../controllers/userController.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, getUserProfile);

// Update user profile
router.put('/profile', authenticate, updateProfile);

// Change password
router.put('/change-password', authenticate, changePassword);

// Delete account
router.delete('/account', authenticate, deleteAccount);

// Get dashboard statistics
router.get('/dashboard-stats', authenticate, getDashboardStats);

// Get user statistics
router.get('/stats', authenticate, getUserStats);

// Test SMTP settings
router.post('/test-smtp', authenticate, testSMTPSettings);

export default router;
