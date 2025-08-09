import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { sendVerificationEmail, sendTwoFactorEmail } from '../services/emailService.js';
import { generateToken } from '../utils/helpers.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, smtpSettings } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = new User({
      name,
      email,
      password,
      smtpSettings,
      emailVerificationToken: generateToken()
    });

    await user.save();

    // Create default subscription
    const subscription = new Subscription({
      user: user._id,
      plan: 'free'
    });
    await subscription.save();

    user.subscription = subscription._id;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, user.emailVerificationToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    console.log('Verification token received:', token); // Debug log

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email already verified'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined; // Clear the token
    await user.save();

    console.log('Email verified for user:', user.email); // Debug log

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    const user = await User.findOne({ email }).populate('subscription');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    if (user.isTwoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          success: true,
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode
      });

      if (!verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid two-factor code'
        });
      }
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
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

export const setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const secret = speakeasy.generateSecret({
      name: `Bulk Email Sender (${user.email})`,
      issuer: 'Bulk Email Sender'
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.userId);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    user.isTwoFactorEnabled = true;
    await user.save();

    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
