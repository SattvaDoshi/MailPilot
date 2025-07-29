// src/middleware/auth.js
import { clerkClient } from '@clerk/express';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await clerkClient.verifyToken(token);
    req.user = session;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
