import User from '../models/User.js';
import { generateSecret, generateQRCode, verifyToken, generateBackupCodes } from '../services/mfaService.js';

export const setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Generate fresh secret
    const secret = generateSecret(user.email);
    const qrCode = await generateQRCode(secret);
    
    // Store exact secret used for QR code
    user.twoFactorSecret = secret.base32;
    await user.save();
    
    console.log('✅ Generated new 2FA secret:', {
      userId: user._id,
      secretLength: secret.base32.length,
      secretSample: secret.base32.substring(0, 8) + '...'
    });
    
    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode,
        manualEntryKey: secret.base32
      }
    });
  } catch (error) {
    console.error('❌ 2FA setup error:', error);
    res.status(500).json({ success: false, message: 'Failed to setup 2FA' });
  }
};


export const enableTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication not setup'
      });
    }
    
    const isValid = verifyToken(user.twoFactorSecret, token);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    
    user.isTwoFactorEnabled = true;
    user.twoFactorBackupCodes = backupCodes;
    await user.save();
    
    res.json({
      success: true,
      message: 'Two-factor authentication enabled',
      backupCodes
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable two-factor authentication'
    });
  }
};

export const disableTwoFactor = async (req, res) => {
  try {
    const { password, token } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user.isTwoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is not enabled'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // Verify 2FA token (current authenticator code)
    const isValidToken = verifyToken(user.twoFactorSecret, token);
    if (!isValidToken) {
      // Check backup codes as fallback
      const backupCodeIndex = user.twoFactorBackupCodes.indexOf(token.toUpperCase());
      if (backupCodeIndex === -1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }
      
      // Don't remove backup code for disable operation
    }
    
    // Disable 2FA
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    await user.save();
    
    console.log(`✅ 2FA disabled for user: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable two-factor authentication'
    });
  }
};


export const regenerateBackupCodes = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId);
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    const backupCodes = generateBackupCodes();
    user.twoFactorBackupCodes = backupCodes;
    await user.save();
    
    res.json({
      success: true,
      backupCodes
    });
  } catch (error) {
    console.error('Backup codes regeneration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate backup codes'
    });
  }
};

export const resetTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Clear all 2FA data
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    await user.save();
    
    console.log(`🔄 Reset 2FA for user: ${user.email}`);
    
    res.json({
      success: true,
      message: '2FA reset successfully. Please set up again with fresh QR code.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
