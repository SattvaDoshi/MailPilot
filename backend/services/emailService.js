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
    // Fix: Use createTransport instead of createTransporter
    const transporter = nodemailer.createTransport(smtpConfig);

    const results = {
      successCount: 0,
      failedCount: 0,
      recipients: []
    };

    // Send emails individually with delay to avoid spam
    for (const contact of group.contacts) {
      try {
        // Personalize content for each recipient
        const personalizedSubject = personalizeContent(subject, contact);
        const personalizedContent = personalizeContent(content, contact);

        await transporter.sendMail({
          from: `${user.name} <${user.smtpSettings.email}>`,
          to: contact.email,
          subject: personalizedSubject,
          html: personalizedContent,
          headers: {
            'X-Mailer': 'Bulk Email Sender',
            'X-Priority': '3',
            'X-MSMail-Priority': 'Normal',
            'List-Unsubscribe': `<mailto:${user.smtpSettings.email}?subject=unsubscribe>`
          }
        });

        results.recipients.push({
          email: contact.email,
          name: contact.name,
          status: 'sent',
          sentAt: new Date()
        });
        results.successCount++;

        // Add delay between emails to avoid being marked as spam
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        results.recipients.push({
          email: contact.email,
          name: contact.name,
          status: 'failed',
          errorMessage: error.message
        });
        results.failedCount++;
        console.error(`Failed to send email to ${contact.email}:`, error.message);
      }
    }

    return results;
  } catch (error) {
    console.error('Error in sendBulkEmails:', error);
    throw error;
  }
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
