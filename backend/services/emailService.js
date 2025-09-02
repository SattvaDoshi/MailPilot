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
    const transporter = nodemailer.createTransporter(smtpConfig);

    const results = {
      successCount: 0,
      failedCount: 0,
      recipients: [],
      startTime: new Date(),
      endTime: null,
      // ✅ Add user audit info
      sentByUser: {
        userId: user._id,
        email: user.email,
        name: user.name
      }
    };

    // Your existing rate limiting configuration
    const rateLimitConfig = {
      emailsPerHour: 100,
      emailsPerMinute: 5,
      baseDelay: 15000,
      maxDelay: 45000,
      burstSize: 3,
      burstCooldown: 120000,
      maxRetries: 2,
      retryDelayMultiplier: 2
    };

    let emailsSentInCurrentHour = 0;
    let emailsSentInCurrentMinute = 0;
    let lastHourReset = Date.now();
    let lastMinuteReset = Date.now();
    let burstCounter = 0;
    let lastBurstTime = 0;

    const addJitter = (delay) => {
      const jitter = Math.random() * 0.3 * delay;
      return Math.floor(delay + jitter);
    };

    const calculateDelay = (index, totalEmails) => {
      let delay = rateLimitConfig.baseDelay;
      const progressFactor = index / totalEmails;
      delay = Math.floor(delay * (1 + progressFactor * 0.5));
      delay = addJitter(delay);
      return Math.min(delay, rateLimitConfig.maxDelay);
    };

    const enforceRateLimit = async (index, totalEmails) => {
      const now = Date.now();
      
      if (now - lastHourReset >= 3600000) {
        emailsSentInCurrentHour = 0;
        lastHourReset = now;
      }
      
      if (now - lastMinuteReset >= 60000) {
        emailsSentInCurrentMinute = 0;
        lastMinuteReset = now;
      }
      
      if (emailsSentInCurrentHour >= rateLimitConfig.emailsPerHour) {
        const waitTime = 3600000 - (now - lastHourReset);
        // ✅ Enhanced logging with user info
        console.log(`🚦 User ${user.email} (${user._id}) hit hourly limit. Waiting ${Math.ceil(waitTime / 1000 / 60)} minutes...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        emailsSentInCurrentHour = 0;
        lastHourReset = Date.now();
      }
      
      if (emailsSentInCurrentMinute >= rateLimitConfig.emailsPerMinute) {
        const waitTime = 60000 - (now - lastMinuteReset);
        console.log(`⏱️ User ${user.email} hit per-minute limit. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        emailsSentInCurrentMinute = 0;
        lastMinuteReset = Date.now();
      }
      
      if (burstCounter >= rateLimitConfig.burstSize) {
        if (now - lastBurstTime < rateLimitConfig.burstCooldown) {
          const cooldownRemaining = rateLimitConfig.burstCooldown - (now - lastBurstTime);
          console.log(`❄️ User ${user.email} burst cooldown active. Waiting ${Math.ceil(cooldownRemaining / 1000)} seconds...`);
          await new Promise(resolve => setTimeout(resolve, cooldownRemaining));
        }
        burstCounter = 0;
      }
      
      if (index > 0) {
        const delay = calculateDelay(index, totalEmails);
        console.log(`⏳ User ${user.email} applying delay: ${(delay / 1000).toFixed(3)}s before sending email ${index + 1}/${totalEmails}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    };

    const sendEmailWithRetry = async (contact, personalizedSubject, personalizedContent, attempt = 1) => {
      try {
        const emailOptions = {
          from: `${user.name} <${user.smtpSettings.email}>`,
          to: contact.email,
          subject: personalizedSubject,
          html: personalizedContent,
          text: personalizedContent.replace(/<[^>]*>/g, ''),
          headers: {
            'X-Mailer': 'MailPilot Professional',
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
            'Content-Type': 'multipart/alternative',
            // ✅ Add user identification headers for audit
            'X-Sender-User-ID': user._id.toString(),
            'X-Campaign-ID': emailRecord._id.toString()
          }
        };

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
          attempt: attempt,
          // ✅ Add user audit info to recipient record
          sentByUser: user._id
        };

      } catch (error) {
        // ✅ Enhanced error logging with user context
        console.error(`❌ User ${user.email} - Attempt ${attempt} failed for ${contact.email}:`, error.message);
        
        if (attempt < rateLimitConfig.maxRetries) {
          const retryDelay = rateLimitConfig.baseDelay * rateLimitConfig.retryDelayMultiplier * attempt;
          console.log(`🔄 User ${user.email} retrying ${contact.email} in ${retryDelay / 1000} seconds... (attempt ${attempt + 1}/${rateLimitConfig.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, addJitter(retryDelay)));
          return await sendEmailWithRetry(contact, personalizedSubject, personalizedContent, attempt + 1);
        }
        
        return {
          success: false,
          email: contact.email,
          name: contact.name,
          status: 'failed',
          errorMessage: error.message,
          attempt: attempt,
          failedByUser: user._id
        };
      }
    };

    // ✅ Enhanced startup logging
    console.log(`🚀 User ${user.email} (${user.name}, ID: ${user._id}) starting bulk email campaign:`);
    console.log(`   📧 Campaign ID: ${emailRecord._id}`);
    console.log(`   👥 Group: ${group.name} (${group.contacts.length} recipients)`);
    console.log(`   📝 Subject: "${subject}"`);
    console.log(`   🕒 Started at: ${results.startTime.toISOString()}`);
    
    // ✅ Update email record with user audit info immediately
    if (emailRecord) {
      emailRecord.status = 'sending';
      emailRecord.startedBy = user._id;
      emailRecord.startedAt = results.startTime;
      emailRecord.lastUpdatedBy = user._id;
      emailRecord.lastUpdatedAt = new Date();
      await emailRecord.save();
    }

    // Process emails with advanced rate limiting
    for (let i = 0; i < group.contacts.length; i++) {
      const contact = group.contacts[i];
      
      try {
        // ✅ Log each email attempt with user context
        console.log(`📤 User ${user.email} sending email ${i + 1}/${group.contacts.length} to ${contact.email}...`);
        
        await enforceRateLimit(i, group.contacts.length);
        
        const personalizedSubject = personalizeContent(subject, contact);
        const personalizedContent = personalizeContent(content, contact);
        
        const result = await sendEmailWithRetry(contact, personalizedSubject, personalizedContent);
        
        if (result.success) {
          results.recipients.push(result);
          results.successCount++;
          emailsSentInCurrentHour++;
          emailsSentInCurrentMinute++;
          burstCounter++;
          lastBurstTime = Date.now();
          
          // ✅ Enhanced success logging
          console.log(`✅ User ${user.email} successfully sent email ${i + 1}/${group.contacts.length} to ${contact.email}`);
          
          // ✅ Update email record progress every 5 emails for real-time status
          if ((i + 1) % 5 === 0) {
            await Email.findByIdAndUpdate(emailRecord._id, {
              successCount: results.successCount,
              failedCount: results.failedCount,
              status: 'sending',
              lastUpdatedBy: user._id,
              lastUpdatedAt: new Date()
            });
          }
          
        } else {
          results.recipients.push(result);
          results.failedCount++;
          console.log(`❌ User ${user.email} failed to send email ${i + 1}/${group.contacts.length} to ${contact.email} after ${rateLimitConfig.maxRetries} attempts: ${result.errorMessage}`);
        }
        
        // ✅ Enhanced progress logging every 10 emails
        if ((i + 1) % 10 === 0) {
          const progress = ((i + 1) / group.contacts.length * 100).toFixed(1);
          const successRate = (results.successCount / (results.successCount + results.failedCount) * 100).toFixed(1);
          console.log(`📊 User ${user.email} progress: ${progress}% complete (${results.successCount} sent, ${results.failedCount} failed, ${successRate}% success rate)`);
        }

      } catch (error) {
        console.error(`💥 User ${user.email} unexpected error processing ${contact.email}:`, error);
        results.recipients.push({
          email: contact.email,
          name: contact.name,
          status: 'error',
          errorMessage: error.message,
          errorByUser: user._id
        });
        results.failedCount++;
      }
    }

    results.endTime = new Date();
    const duration = Math.ceil((results.endTime - results.startTime) / 1000 / 60);
    const successRate = (results.successCount / group.contacts.length * 100).toFixed(1);
    
    // ✅ Enhanced completion logging with user audit
    console.log(`🎉 User ${user.email} bulk email campaign completed!`);
    console.log(`   ⏱️ Duration: ${duration} minutes`);
    console.log(`   ✅ Successful: ${results.successCount}/${group.contacts.length}`);
    console.log(`   ❌ Failed: ${results.failedCount}/${group.contacts.length}`);
    console.log(`   📈 Success rate: ${successRate}%`);
    console.log(`   🕒 Completed at: ${results.endTime.toISOString()}`);

    // ✅ Final update email record with complete audit trail
    if (emailRecord) {
      emailRecord.successCount = results.successCount;
      emailRecord.failedCount = results.failedCount;
      emailRecord.status = 'completed';
      emailRecord.completedAt = results.endTime;
      emailRecord.duration = duration;
      emailRecord.successRate = parseFloat(successRate);
      emailRecord.completedBy = user._id;
      emailRecord.lastUpdatedBy = user._id;
      emailRecord.lastUpdatedAt = new Date();
      emailRecord.recipients = results.recipients;
      
      // Add summary audit info
      emailRecord.auditLog = {
        startedBy: user._id,
        completedBy: user._id,
        startTime: results.startTime,
        endTime: results.endTime,
        totalDuration: duration,
        userEmail: user.email,
        userName: user.name
      };
      
      await emailRecord.save();
    }

    // ✅ Log final audit summary
    console.log(`📝 Campaign ${emailRecord._id} audit: User ${user.email} sent ${results.successCount}/${group.contacts.length} emails successfully in ${duration} minutes`);

    return results;

  } catch (error) {
    // ✅ Enhanced error logging with user context
    console.error(`💥 Critical error in sendBulkEmails for user ${user.email} (${user._id}):`, error);
    
    // Update email record with error info
    if (emailRecord) {
      emailRecord.status = 'failed';
      emailRecord.errorMessage = error.message;
      emailRecord.failedBy = user._id;
      emailRecord.lastUpdatedBy = user._id;
      emailRecord.lastUpdatedAt = new Date();
      await emailRecord.save();
    }
    
    throw new Error(`Bulk email send failed for user ${user.email}: ${error.message}`);
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
