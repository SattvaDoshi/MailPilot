import User from '../models/User.js';
import { generateSecret, generateQRCode, verifyToken, generateBackupCodes } from '../services/mfaService.js';

export const setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    const secret = generateSecret(user.email);
    const qrCode = await generateQRCode(secret);
    
    // Store secret temporarily (not yet enabled)
    user.twoFactorSecret = secret.base32;
    await user.save();
    
    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode,
        manualEntryKey: secret.base32
      }
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup two-factor authentication'
    });
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

