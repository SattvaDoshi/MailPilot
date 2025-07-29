// src/controllers/authController.js
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { SUBSCRIPTION_LIMITS } from '../utils/constants.js';
import Joi from 'joi';

const userProfileSchema = Joi.object({
  firstName: Joi.string().max(50),
  lastName: Joi.string().max(50),
  email: Joi.string().email()
});

export const registerUser = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ error: 'Clerk ID and email are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      clerkId,
      email,
      firstName,
      lastName,
      subscription: 'free'
    });

    await user.save();

    // Create default subscription
    const subscription = new Subscription({
      userId: clerkId,
      plan: 'free',
      status: 'active',
      emailLimit: SUBSCRIPTION_LIMITS.free.emailLimit,
      groupLimit: SUBSCRIPTION_LIMITS.free.groupLimit
    });

    await subscription.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub });
    const subscription = await Subscription.findOne({ userId: req.user.sub });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscription: user.subscription,
        emailsUsedThisMonth: user.emailsUsedThisMonth,
        groupsCreated: user.groupsCreated,
        subscriptionExpiry: user.subscriptionExpiry
      },
      subscription: subscription || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { error, value } = userProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: req.user.sub },
      value,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    // Delete user's subscription
    await Subscription.findOneAndDelete({ userId: req.user.sub });
    
    // Delete user
    const user = await User.findOneAndDelete({ clerkId: req.user.sub });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
