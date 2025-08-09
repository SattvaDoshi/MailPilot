import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import { validateSMTPSettings } from '../services/smtpService.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password -twoFactorSecret')
      .populate('subscription');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, smtpSettings } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (name) user.name = name;
    if (smtpSettings) {
      // Validate SMTP settings before saving
      const validation = await validateSMTPSettings(smtpSettings);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: `SMTP validation failed: ${validation.error}`
        });
      }
      user.smtpSettings = smtpSettings;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test SMTP settings
router.post('/test-smtp', authenticate, async (req, res) => {
  try {
    const { smtpSettings } = req.body;
    
    const validation = await validateSMTPSettings(smtpSettings);
    
    res.json({
      success: validation.valid,
      message: validation.valid ? 'SMTP settings are valid' : validation.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('subscription');
    
    res.json({
      success: true,
      data: {
        emailsSentThisMonth: user.emailsSentThisMonth,
        emailLimit: user.subscription.emailLimit,
        remainingEmails: user.subscription.emailLimit === -1 ? 'unlimited' : 
                        user.subscription.emailLimit - user.emailsSentThisMonth,
        planType: user.subscription.plan
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
