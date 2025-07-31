// src/controllers/smtpController.js
import User from '../models/User.js';
import emailService from '../services/emailService.js';
import Joi from 'joi';
import crypto from 'crypto';

const smtpConfigSchema = Joi.object({
  provider: Joi.string().valid('gmail', 'outlook', 'yahoo', 'custom').required(),
  host: Joi.string().required(),
  port: Joi.number().required(),
  secure: Joi.boolean().default(false),
  user: Joi.string().email().required(),
  pass: Joi.string().required()
});

// Encrypt password before storing
const encrypt = (text) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex')
  };
};

// Decrypt password when needed
const decrypt = (encryptedData) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);
  
  const decipher = crypto.createDecipher(algorithm, key);
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

export const configureSmtp = async (req, res) => {
  try {
    const { error, value } = smtpConfigSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Test the configuration first
    await emailService.testSmtpConfiguration(value);

    // Encrypt the password
    const encryptedPass = encrypt(value.pass);

    // Update user's SMTP configuration
    await User.findOneAndUpdate(
      { clerkId: req.user.sub },
      { 
        smtpConfig: {
          ...value,
          pass: encryptedPass.encrypted,
          isVerified: true
        },
        defaultFromAddress: value.user
      },
      { upsert: true }
    );

    res.json({
      message: 'SMTP configuration saved and verified successfully',
      fromAddress: value.user
    });
  } catch (error) {
    res.status(400).json({ 
      error: error.message || 'Failed to configure SMTP settings' 
    });
  }
};

export const getSmtpConfig = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub });
    
    if (!user?.smtpConfig) {
      return res.json({ configured: false });
    }

    res.json({
      configured: true,
      config: {
        provider: user.smtpConfig.provider,
        host: user.smtpConfig.host,
        port: user.smtpConfig.port,
        secure: user.smtpConfig.secure,
        user: user.smtpConfig.user,
        isVerified: user.smtpConfig.isVerified
      },
      defaultFromAddress: user.defaultFromAddress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const testSmtpConfig = async (req, res) => {
  try {
    const { error, value } = smtpConfigSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await emailService.testSmtpConfiguration(value);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      error: error.message || 'SMTP test failed' 
    });
  }
};
