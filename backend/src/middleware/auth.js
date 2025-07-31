// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    req.user = { userId: user._id, ...user.toObject() };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
