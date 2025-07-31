// src/controllers/authController.js
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer'; 
import Joi from 'joi';
import { SUBSCRIPTION_LIMITS } from '../utils/constants.js';

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
});

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Create email transporter for system emails
// Create email transporter for system emails
const createSystemTransporter = () => {
  return nodemailer.createTransport({  // ✅ Correct method name
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};


// Send verification email
const sendVerificationEmail = async (user, verificationToken) => {
  const transporter = createSystemTransporter();
  
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: 'Verify Your MailPilot Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Welcome to MailPilot!</h1>
        <p>Hi ${user.firstName},</p>
        <p>Thanks for signing up! Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    await user.save();

    // Create default subscription
    const subscription = new Subscription({
      userId: user._id,
      plan: 'free',
      status: 'active',
      emailLimit: SUBSCRIPTION_LIMITS.free.emailLimit,
      groupLimit: SUBSCRIPTION_LIMITS.free.groupLimit
    });

    await subscription.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email address before logging in',
        needsVerification: true
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscription: user.subscription,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { token } = value;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully! You can now log in.',
      verified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.json({
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const subscription = await Subscription.findOne({ userId: req.user.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscription: user.subscription,
        emailsUsedThisMonth: user.emailsUsedThisMonth,
        groupsCreated: user.groupsCreated,
        subscriptionExpiry: user.subscriptionExpiry,
        isEmailVerified: user.isEmailVerified
      },
      subscription: subscription || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};
