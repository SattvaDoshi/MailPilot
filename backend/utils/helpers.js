import crypto from 'crypto';

export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const personalizeContent = (content, contact) => {
  let personalizedContent = content;
  
  // Replace common placeholders
  personalizedContent = personalizedContent.replace(/\{\{name\}\}/g, contact.name || 'there');
  personalizedContent = personalizedContent.replace(/\{\{email\}\}/g, contact.email || '');
  
  // Replace custom field placeholders
  if (contact.customFields) {
    for (const [key, value] of contact.customFields.entries()) {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      personalizedContent = personalizedContent.replace(placeholder, value);
    }
  }
  
  return personalizedContent;
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeHtml = (html) => {
  // Basic HTML sanitization - you might want to use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
};
