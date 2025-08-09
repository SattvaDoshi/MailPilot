export const verificationEmailTemplate = (verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { 
                display: inline-block; 
                background: #007bff; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Bulk Email Sender</h1>
            </div>
            <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Thank you for registering with Bulk Email Sender! Please click the button below to verify your email address:</p>
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email</a>
                </div>
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© 2024 Bulk Email Sender. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const twoFactorEmailTemplate = (code) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Two-Factor Authentication</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; text-align: center; }
            .code { 
                font-size: 32px; 
                font-weight: bold; 
                background: #007bff; 
                color: white; 
                padding: 20px; 
                border-radius: 10px; 
                display: inline-block;
                letter-spacing: 5px;
                margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Authentication Code</h1>
            </div>
            <div class="content">
                <h2>Your 2FA Code</h2>
                <p>Use this code to complete your login:</p>
                <div class="code">${code}</div>
                <p>This code will expire in 10 minutes.</p>
                <p><strong>Important:</strong> Never share this code with anyone.</p>
            </div>
            <div class="footer">
                <p>© 2024 Bulk Email Sender. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const welcomeEmailTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Bulk Email Sender</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .feature { margin: 20px 0; padding: 15px; background: white; border-radius: 5px; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Bulk Email Sender!</h1>
            </div>
            <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>Welcome to Bulk Email Sender! We're excited to have you on board.</p>
                
                <div class="feature">
                    <h3>🎯 Create Contact Groups</h3>
                    <p>Organize your contacts into different groups for targeted campaigns.</p>
                </div>
                
                <div class="feature">
                    <h3>🤖 AI-Powered Templates</h3>
                    <p>Generate professional email templates using our AI assistant.</p>
                </div>
                
                <div class="feature">
                    <h3>📧 Personalized Bulk Emails</h3>
                    <p>Send personalized emails to your contacts without using CC/BCC.</p>
                </div>
                
                <div class="feature">
                    <h3>📊 Analytics & Tracking</h3>
                    <p>Track your email campaigns and see detailed analytics.</p>
                </div>
                
                <p>Your current plan allows you to send up to <strong>20 emails</strong> and create up to <strong>2 contact groups</strong>.</p>
                <p>Ready to get started? Log in to your account and send your first campaign!</p>
            </div>
            <div class="footer">
                <p>© 2024 Bulk Email Sender. All rights reserved.</p>
                <p>Need help? Contact us at support@bulkemailsender.com</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
