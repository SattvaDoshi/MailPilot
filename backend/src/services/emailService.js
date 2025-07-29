// src/services/emailService.js
import nodemailer from 'nodemailer';
import EmailLog from '../models/EmailLog.js';
import User from '../models/User.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({  // ✅ Fixed: createTransport
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendBulkEmails(userId, campaignId, emails, template, fromAddress) {
    const results = [];
    
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
          from: fromAddress,
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

        await this.transporter.sendMail(mailOptions);
        
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
