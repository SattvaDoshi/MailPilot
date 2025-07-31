// src/services/emailService.js
import nodemailer from 'nodemailer';
import EmailLog from '../models/EmailLog.js';
import User from '../models/User.js';

class EmailService {
  constructor() {
    this.transporterCache = new Map(); // Cache transporters for performance
  }

  // Create transporter for specific user
  async createUserTransporter(userId) {
    // Check cache first
    if (this.transporterCache.has(userId)) {
      return this.transporterCache.get(userId);
    }

    const user = await User.findOne({ clerkId: userId });
    
    if (!user?.smtpConfig) {
      throw new Error('SMTP configuration not found. Please configure your email settings.');
    }

    const transporter = nodemailer.createTransport({
      host: user.smtpConfig.host,
      port: user.smtpConfig.port,
      secure: user.smtpConfig.secure,
      auth: {
        user: user.smtpConfig.user,
        pass: user.smtpConfig.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify the connection
    try {
      await transporter.verify();
      
      // Cache the transporter for 1 hour
      this.transporterCache.set(userId, transporter);
      setTimeout(() => {
        this.transporterCache.delete(userId);
      }, 60 * 60 * 1000); // 1 hour
      
      return transporter;
    } catch (error) {
      throw new Error(`Email configuration verification failed: ${error.message}`);
    }
  }

  async sendBulkEmails(userId, campaignId, emails, template, fromAddress) {
    const results = [];
    
    // Get user's transporter
    const transporter = await this.createUserTransporter(userId);
    
    for (const emailData of emails) {
      try {
        const personalizedContent = this.personalizeContent(
          template.htmlContent, 
          emailData.variables || {}
        );
        
        const personalizedSubject = this.personalizeContent(
          template.subject,
          emailData.variables || {}
        );

        const mailOptions = {
          from: fromAddress, // User's email address
          to: emailData.email,
          subject: personalizedSubject,
          html: personalizedContent,
          text: template.textContent || this.htmlToText(personalizedContent)
        };

        // Log email attempt
        const emailLog = new EmailLog({
          userId,
          campaignId,
          recipientEmail: emailData.email,
          recipientName: emailData.name,
          subject: personalizedSubject,
          status: 'pending',
          groupId: emailData.groupId,
          templateId: template._id
        });

        await transporter.sendMail(mailOptions);
        
        emailLog.status = 'sent';
        emailLog.sentAt = new Date();
        await emailLog.save();

        results.push({
          email: emailData.email,
          status: 'sent',
          sentAt: new Date()
        });

        // Add delay between emails to avoid spam detection
        await this.delay(1000);

      } catch (error) {
        const emailLog = new EmailLog({
          userId,
          campaignId,
          recipientEmail: emailData.email,
          recipientName: emailData.name,
          subject: template.subject,
          status: 'failed',
          errorMessage: error.message,
          groupId: emailData.groupId,
          templateId: template._id
        });
        await emailLog.save();

        results.push({
          email: emailData.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Update user's email usage
    await User.findOneAndUpdate(
      { clerkId: userId },
      { $inc: { emailsUsedThisMonth: emails.length } }
    );

    return results;
  }

  // Test user's SMTP configuration
  async testSmtpConfiguration(smtpConfig) {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    try {
      await transporter.verify();
      
      // Send a test email
      await transporter.sendMail({
        from: smtpConfig.user,
        to: smtpConfig.user, // Send to self
        subject: 'MailPilot SMTP Test',
        html: `
          <h2>SMTP Configuration Successful!</h2>
          <p>Your email configuration has been verified and is ready to use with MailPilot.</p>
          <p>You can now send bulk email campaigns using this email account.</p>
        `
      });

      return { success: true, message: 'SMTP configuration verified successfully' };
    } catch (error) {
      throw new Error(`SMTP verification failed: ${error.message}`);
    }
  }

  personalizeContent(content, variables) {
    let personalizedContent = content;
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalizedContent = personalizedContent.replace(regex, variables[key]);
    });
    
    return personalizedContent;
  }

  htmlToText(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new EmailService();
