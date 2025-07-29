// src/config/nodemailer.js
import nodemailer from 'nodemailer';

// Create transporter with Gmail
export const createTransporter = () => {
  return nodemailer.createTransport({  // ✅ Fixed: createTransport
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS // Use App Password for Gmail
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error.message);
    return false;
  }
};

// Create transporter for custom SMTP settings
export const createCustomTransporter = (smtpConfig) => {
  return nodemailer.createTransport({  // ✅ Fixed: createTransport
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure || false,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates for system emails
export const systemEmailTemplates = {
  welcome: {
    subject: 'Welcome to Bulk Email Sender!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Bulk Email Sender!</h1>
        <p>Thank you for joining our platform. You can now start sending personalized bulk emails.</p>
        <p>Your free plan includes:</p>
        <ul>
          <li>20 emails per month</li>
          <li>2 contact groups</li>
          <li>Basic email templates</li>
        </ul>
        <p>Ready to upgrade? Check out our <a href="#">premium plans</a>.</p>
      </div>
    `
  },
  subscriptionActivated: {
    subject: 'Subscription Activated Successfully!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">Subscription Activated!</h1>
        <p>Your {{planType}} subscription has been activated successfully.</p>
        <p>You now have access to:</p>
        <ul>
          <li>{{emailLimit}} emails per month</li>
          <li>{{groupLimit}} contact groups</li>
          <li>Advanced features</li>
        </ul>
        <p>Thank you for choosing our service!</p>
      </div>
    `
  }
};

export default createTransporter;
