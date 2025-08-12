import User from '../models/User.js';
import Group from '../models/Group.js';
import Email from '../models/Email.js';
import Subscription from '../models/Subscription.js';
import bcrypt from 'bcryptjs';
import { validateSMTPSettings } from '../services/smtpService.js';

// Get user profile
export const getUserProfile = async (req, res) => {
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
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, smtpSettings } = req.body;
    
    const user = await User.findById(req.userId);
    
    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      user.email = email;
      user.isEmailVerified = false; // Re-verification required
    }
    
    if (name) user.name = name;
    
    // Handle SMTP settings if provided
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
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        smtpSettings: user.smtpSettings
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.userId);
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    const user = await User.findById(req.userId);
    
    // Verify password before deletion
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }
    
    // Delete user's data
    await Group.deleteMany({ user: req.userId });
    await Email.deleteMany({ user: req.userId });
    await Subscription.deleteMany({ user: req.userId });
    await User.findByIdAndDelete(req.userId);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get counts
    const groupsCount = await Group.countDocuments({ user: userId });
    const emailCampaigns = await Email.countDocuments({ user: userId });
    
    // Get recent activity
    const recentEmails = await Email.find({ user: userId })
      .populate('group', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const user = await User.findById(userId).populate('subscription');
    
    res.json({
      success: true,
      data: {
        stats: {
          totalGroups: groupsCount,
          totalCampaigns: emailCampaigns,
          emailsSentThisMonth: user.emailsSentThisMonth,
          emailsRemaining: user.subscription.emailLimit === -1 ? 
                          'unlimited' : 
                          Math.max(0, user.subscription.emailLimit - user.emailsSentThisMonth)
        },
        recentActivity: recentEmails,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user statistics (for subscription info)
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('subscription');
    
    if (!user.subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }
    
    res.json({
      success: true,
      data: {
        emailsSentThisMonth: user.emailsSentThisMonth,
        emailLimit: user.subscription.emailLimit,
        remainingEmails: user.subscription.emailLimit === -1 ? 'unlimited' : 
                        Math.max(0, user.subscription.emailLimit - user.emailsSentThisMonth),
        planType: user.subscription.plan,
        subscriptionStatus: user.subscription.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Test SMTP settings
export const testSMTPSettings = async (req, res) => {
  try {
    const { smtpSettings } = req.body;
    
    if (!smtpSettings) {
      return res.status(400).json({
        success: false,
        message: 'SMTP settings are required'
      });
    }
    
    const validation = await validateSMTPSettings(smtpSettings);
    
    res.json({
      success: validation.valid,
      message: validation.valid ? 'SMTP settings are valid' : validation.error
    });
  } catch (error) {
    console.error('SMTP test error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
