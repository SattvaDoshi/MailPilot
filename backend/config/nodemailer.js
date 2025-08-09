import nodemailer from 'nodemailer';

export const createTransporter = (smtpConfig) => {
  return nodemailer.createTransporter({
    ...smtpConfig,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000, // 1 second between messages
    rateLimit: 1
  });
};

export const getEmailDeliverySettings = () => {
  return {
    // Headers to improve deliverability
    defaultHeaders: {
      'X-Mailer': 'Bulk Email Sender v1.0',
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Precedence': 'bulk',
      'Auto-Submitted': 'auto-generated'
    },
    
    // Retry configuration
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
    
    // Rate limiting
    messageDelay: 1000, // 1 second between emails
    connectionDelay: 2000, // 2 seconds between SMTP connections
    
    // Timeout settings
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 60000 // 60 seconds
  };
};
