import User from '../models/User.js';
import Group from '../models/Group.js';
import Email from '../models/Email.js';
import bcrypt from 'bcryptjs';

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
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
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

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
                          user.subscription.emailLimit - user.emailsSentThisMonth
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
