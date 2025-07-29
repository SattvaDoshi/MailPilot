// src/middleware/subscriptionCheck.js
import User from '../../models/User.js';
import Subscription from '../../models/Subscription.js';
import { SUBSCRIPTION_LIMITS } from '../../utils/constants.js';

export const checkEmailLimit = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub });
    const subscription = await Subscription.findOne({ userId: req.user.sub });
    
    if (!user || !subscription) {
      return res.status(404).json({ error: 'User or subscription not found' });
    }

    const limit = SUBSCRIPTION_LIMITS[subscription.plan].emailLimit;
    
    if (limit !== -1 && user.emailsUsedThisMonth >= limit) {
      return res.status(403).json({ 
        error: 'Email limit exceeded for current subscription',
        currentUsage: user.emailsUsedThisMonth,
        limit: limit
      });
    }

    req.user.subscription = subscription;
    req.user.profile = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Subscription check failed' });
  }
};

export const checkGroupLimit = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub });
    const subscription = await Subscription.findOne({ userId: req.user.sub });
    
    const limit = SUBSCRIPTION_LIMITS[subscription.plan].groupLimit;
    
    if (limit !== -1 && user.groupsCreated >= limit) {
      return res.status(403).json({ 
        error: 'Group limit exceeded for current subscription',
        currentUsage: user.groupsCreated,
        limit: limit
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Group limit check failed' });
  }
};
