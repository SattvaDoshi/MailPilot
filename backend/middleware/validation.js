import Joi from 'joi';

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

// User validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  smtpSettings: Joi.object({
    provider: Joi.string().valid('gmail', 'yahoo', 'outlook', 'custom').required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    host: Joi.string().when('provider', { is: 'custom', then: Joi.required() }),
    port: Joi.number().when('provider', { is: 'custom', then: Joi.required() }),
    secure: Joi.boolean().when('provider', { is: 'custom', then: Joi.required() })
  }).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  twoFactorCode: Joi.string().length(6).optional()
});

// Group validation schemas
export const groupSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  contacts: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      customFields: Joi.object().optional()
    })
  ).optional()
});

// Template validation schemas
export const templateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  subject: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).required(),
  groupId: Joi.string().required(),
  variables: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      placeholder: Joi.string().required()
    })
  ).optional()
});

// Email validation schemas
export const sendEmailSchema = Joi.object({
  groupId: Joi.string().required(),
  templateId: Joi.string().optional(),
  subject: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).required(),
  customContent: Joi.string().optional()
});

// AI template generation schema
export const aiTemplateSchema = Joi.object({
  prompt: Joi.string().min(10).max(1000).required(),
  groupId: Joi.string().required(),
  tone: Joi.string().valid('professional', 'casual', 'friendly', 'formal').required(),
  purpose: Joi.string().valid('marketing', 'newsletter', 'announcement', 'follow-up', 'invitation').required()
});

// Subscription validation schemas
export const subscriptionSchema = Joi.object({
  plan: Joi.string().valid('basic', 'pro', 'unlimited').required()
});

export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateGroup = validate(groupSchema);
export const validateTemplate = validate(templateSchema);
export const validateSendEmail = validate(sendEmailSchema);
export const validateAITemplate = validate(aiTemplateSchema);
export const validateSubscription = validate(subscriptionSchema);
