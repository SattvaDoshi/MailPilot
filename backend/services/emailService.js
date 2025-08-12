import nodemailer from 'nodemailer';
import { getSMTPConfig } from './smtpService.js';
import { personalizeContent } from '../utils/helpers.js';

export const sendVerificationEmail = async (email, token) => {
  try {
    // Fix: Use createTransport instead of createTransporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your provider, for custom SMTP use host/port
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // <-- ADD this line
      }
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: 'Verify Your Email - Bulk Email Sender',
      html: `
        <h2>Email Verification</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
      `
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendBulkEmails = async (user, group, emailRecord, subject, content) => {
  try {
    const smtpConfig = getSMTPConfig(user.smtpSettings);
    const transporter = nodemailer.createTransport(smtpConfig);

    const results = {
      successCount: 0,
      failedCount: 0,
      recipients: [],
      startTime: new Date(),
      endTime: null
    };

    // Advanced rate limiting configuration
    const rateLimitConfig = {
      // Emails per hour (conservative approach)
      emailsPerHour: 100,
      // Emails per minute
      emailsPerMinute: 5,
      // Base delay between emails (milliseconds)
      baseDelay: 15000, // 15 seconds
      // Maximum delay with jitter (milliseconds)
      maxDelay: 45000, // 45 seconds
      // Burst size (emails sent quickly before applying delay)
      burstSize: 3,
      // Cool-down period after burst (milliseconds)
      burstCooldown: 120000, // 2 minutes
      // Retry attempts for failed emails
      maxRetries: 2,
      // Delay multiplier for retries
      retryDelayMultiplier: 2
    };

    // Track sending metrics
    let emailsSentInCurrentHour = 0;
    let emailsSentInCurrentMinute = 0;
    let lastHourReset = Date.now();
    let lastMinuteReset = Date.now();
    let burstCounter = 0;
    let lastBurstTime = 0;

    // Helper function to add jitter to delays
    const addJitter = (delay) => {
      const jitter = Math.random() * 0.3 * delay; // 30% jitter
      return Math.floor(delay + jitter);
    };

    // Helper function to calculate dynamic delay
    const calculateDelay = (index, totalEmails) => {
      let delay = rateLimitConfig.baseDelay;
      
      // Increase delay based on position in queue
      const progressFactor = index / totalEmails;
      delay = Math.floor(delay * (1 + progressFactor * 0.5));
      
      // Add jitter to make sending pattern less predictable
      delay = addJitter(delay);
      
      return Math.min(delay, rateLimitConfig.maxDelay);
    };

    // Helper function to check and enforce rate limits
    const enforceRateLimit = async (index, totalEmails) => {
      const now = Date.now();
      
      // Reset hourly counter
      if (now - lastHourReset >= 3600000) { // 1 hour
        emailsSentInCurrentHour = 0;
        lastHourReset = now;
      }
      
      // Reset minute counter
      if (now - lastMinuteReset >= 60000) { // 1 minute
        emailsSentInCurrentMinute = 0;
        lastMinuteReset = now;
      }
      
      // Check hourly limit
      if (emailsSentInCurrentHour >= rateLimitConfig.emailsPerHour) {
        const waitTime = 3600000 - (now - lastHourReset);
        console.log(`Hourly limit reached. Waiting ${Math.ceil(waitTime / 1000 / 60)} minutes...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        emailsSentInCurrentHour = 0;
        lastHourReset = Date.now();
      }
      
      // Check per-minute limit
      if (emailsSentInCurrentMinute >= rateLimitConfig.emailsPerMinute) {
        const waitTime = 60000 - (now - lastMinuteReset);
        console.log(`Per-minute limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        emailsSentInCurrentMinute = 0;
        lastMinuteReset = Date.now();
      }
      
      // Handle burst control
      if (burstCounter >= rateLimitConfig.burstSize) {
        if (now - lastBurstTime < rateLimitConfig.burstCooldown) {
          const cooldownRemaining = rateLimitConfig.burstCooldown - (now - lastBurstTime);
          console.log(`Burst cooldown active. Waiting ${Math.ceil(cooldownRemaining / 1000)} seconds...`);
          await new Promise(resolve => setTimeout(resolve, cooldownRemaining));
        }
        burstCounter = 0;
      }
      
      // Apply dynamic delay
      if (index > 0) {
        const delay = calculateDelay(index, totalEmails);
        console.log(`Applying delay: ${delay / 1000}s before sending email ${index + 1}/${totalEmails}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    };

    // Helper function to send individual email with retries
    const sendEmailWithRetry = async (contact, personalizedSubject, personalizedContent, attempt = 1) => {
      try {
        // Enhanced email headers to improve deliverability
        const emailOptions = {
          from: `${user.name} <${user.smtpSettings.email}>`,
          to: contact.email,
          subject: personalizedSubject,
          html: personalizedContent,
          text: personalizedContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
          headers: {
            'X-Mailer': 'Professional Email Service',
            'X-Priority': '3',
            'X-MSMail-Priority': 'Normal',
            'Precedence': 'bulk',
            'List-Unsubscribe': `<mailto:${user.smtpSettings.email}?subject=unsubscribe&body=Please unsubscribe ${contact.email}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            'Return-Path': user.smtpSettings.email,
            'Reply-To': user.smtpSettings.email,
            'Message-ID': `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${user.smtpSettings.email.split('@')[1]}>`,
            'Date': new Date().toUTCString(),
            'MIME-Version': '1.0',
            'Content-Type': 'multipart/alternative'
          }
        };

        // Add authentication headers if available
        if (user.smtpSettings.dkim) {
          emailOptions.dkim = user.smtpSettings.dkim;
        }

        await transporter.sendMail(emailOptions);
        
        return {
          success: true,
          email: contact.email,
          name: contact.name,
          status: 'sent',
          sentAt: new Date(),
          attempt: attempt
        };

      } catch (error) {
        console.error(`Attempt ${attempt} failed for ${contact.email}:`, error.message);
        
        // Retry logic
        if (attempt < rateLimitConfig.maxRetries) {
          const retryDelay = rateLimitConfig.baseDelay * rateLimitConfig.retryDelayMultiplier * attempt;
          console.log(`Retrying ${contact.email} in ${retryDelay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, addJitter(retryDelay)));
          return await sendEmailWithRetry(contact, personalizedSubject, personalizedContent, attempt + 1);
        }
        
        return {
          success: false,
          email: contact.email,
          name: contact.name,
          status: 'failed',
          errorMessage: error.message,
          attempt: attempt
        };
      }
    };

    console.log(`Starting bulk email send to ${group.contacts.length} recipients...`);
    
    // Process emails with advanced rate limiting
    for (let i = 0; i < group.contacts.length; i++) {
      const contact = group.contacts[i];
      
      try {
        // Enforce rate limiting before sending
        await enforceRateLimit(i, group.contacts.length);
        
        // Personalize content
        const personalizedSubject = personalizeContent(subject, contact);
        const personalizedContent = personalizeContent(content, contact);
        
        // Send email with retry logic
        const result = await sendEmailWithRetry(contact, personalizedSubject, personalizedContent);
        
        if (result.success) {
          results.recipients.push(result);
          results.successCount++;
          emailsSentInCurrentHour++;
          emailsSentInCurrentMinute++;
          burstCounter++;
          lastBurstTime = Date.now();
          
          console.log(`✅ Email sent successfully to ${contact.email} (${i + 1}/${group.contacts.length})`);
        } else {
          results.recipients.push(result);
          results.failedCount++;
          console.log(`❌ Failed to send email to ${contact.email} after ${rateLimitConfig.maxRetries} attempts`);
        }
        
        // Log progress every 10 emails
        if ((i + 1) % 10 === 0) {
          const progress = ((i + 1) / group.contacts.length * 100).toFixed(1);
          console.log(`📊 Progress: ${progress}% (${results.successCount} sent, ${results.failedCount} failed)`);
        }

      } catch (error) {
        console.error(`Unexpected error processing ${contact.email}:`, error);
        results.recipients.push({
          email: contact.email,
          name: contact.name,
          status: 'error',
          errorMessage: error.message
        });
        results.failedCount++;
      }
    }

    results.endTime = new Date();
    const duration = Math.ceil((results.endTime - results.startTime) / 1000 / 60);
    
    console.log(`📧 Bulk email send completed in ${duration} minutes:`);
    console.log(`   ✅ Successful: ${results.successCount}`);
    console.log(`   ❌ Failed: ${results.failedCount}`);
    console.log(`   📈 Success rate: ${(results.successCount / group.contacts.length * 100).toFixed(1)}%`);

    // Update email record with results
    if (emailRecord) {
      emailRecord.sentCount = results.successCount;
      emailRecord.failedCount = results.failedCount;
      emailRecord.completedAt = results.endTime;
      emailRecord.duration = duration;
    }

    return results;

  } catch (error) {
    console.error('❌ Critical error in sendBulkEmails:', error);
    throw new Error(`Bulk email send failed: ${error.message}`);
  }
};

// Helper function to validate email configuration
export const validateEmailConfig = (user) => {
  const issues = [];
  
  if (!user.smtpSettings.email) {
    issues.push('SMTP email address is required');
  }
  
  if (!user.smtpSettings.host) {
    issues.push('SMTP host is required');
  }
  
  if (!user.smtpSettings.port) {
    issues.push('SMTP port is required');
  }
  
  return issues;
};

// Helper function to optimize email content for deliverability
export const optimizeEmailContent = (content) => {
  const optimizations = {
    applied: [],
    warnings: []
  };
  
  // Check for spam trigger words
  const spamWords = [
    'free', 'urgent', 'act now', 'limited time', 'click here',
    'guarantee', 'no risk', 'congratulations', 'winner'
  ];
  
  const lowerContent = content.toLowerCase();
  const foundSpamWords = spamWords.filter(word => lowerContent.includes(word));
  
  if (foundSpamWords.length > 0) {
    optimizations.warnings.push(`Consider avoiding these potential spam trigger words: ${foundSpamWords.join(', ')}`);
  }
  
  // Check text-to-image ratio
  const textLength = content.replace(/<[^>]*>/g, '').length;
  const imageCount = (content.match(/<img/gi) || []).length;
  
  if (imageCount > 0 && textLength / imageCount < 100) {
    optimizations.warnings.push('Consider adding more text content - high image-to-text ratio can trigger spam filters');
  }
  
  // Check for excessive links
  const linkCount = (content.match(/<a\s+[^>]*href/gi) || []).length;
  if (linkCount > 5) {
    optimizations.warnings.push('Consider reducing the number of links - excessive links can trigger spam filters');
  }
  
  return optimizations;
};

export const sendTwoFactorEmail = async (email, code) => {
  try {
    // Fix: Use createTransport instead of createTransporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: 'Two-Factor Authentication Code',
      html: `
        <h2>Two-Factor Authentication</h2>
        <p>Your authentication code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    });
  } catch (error) {
    console.error('Error sending 2FA email:', error);
    throw error;
  }
};
