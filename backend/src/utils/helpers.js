// src/utils/helpers.js
import crypto from 'crypto';

export const generateId = () => {
  return crypto.randomBytes(16).toString('hex');
};

export const hashString = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeHtml = (html) => {
  // Basic HTML sanitization (you might want to use a library like DOMPurify for production)
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const calculateUsagePercentage = (used, limit) => {
  if (limit === -1) return 0; // Unlimited
  return Math.round((used / limit) * 100);
};

export const isValidPlan = (plan) => {
  const validPlans = ['free', 'basic', 'premium', 'unlimited'];
  return validPlans.includes(plan);
};

export const parseContactsCSV = (csvData) => {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const contacts = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length >= 2 && validateEmail(values[1])) {
      const contact = {
        name: values[0] || '',
        email: values[1],
        customFields: {}
      };
      
      // Add custom fields
      for (let j = 2; j < headers.length && j < values.length; j++) {
        if (values[j]) {
          contact.customFields[headers[j]] = values[j];
        }
      }
      
      contacts.push(contact);
    }
  }
  
  return contacts;
};

export const createEmailPreview = (template, sampleData = {}) => {
  let preview = template.htmlContent;
  
  // Replace common variables with sample data
  const defaultSample = {
    name: 'John Doe',
    email: 'john@example.com',
    company: 'ABC Corp',
    ...sampleData
  };
  
  Object.keys(defaultSample).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    preview = preview.replace(regex, defaultSample[key]);
  });
  
  // Remove any remaining unreplaced variables
  preview = preview.replace(/{{[^}]+}}/g, '[Variable]');
  
  return preview;
};

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
