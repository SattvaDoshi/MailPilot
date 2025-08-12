import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export const generateSecret = (userEmail) => {
  return speakeasy.generateSecret({
    name: `MailPilot (${userEmail})`,
    issuer: 'MailPilot',
    length: 32
  });
};

export const generateQRCode = async (secret) => {
  try {
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return qrCodeUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

// In your mfaService.js
export const verifyToken = (secret, token) => {
  const currentTime = Math.floor(Date.now() / 1000);
  
  console.log('TOTP Verification Debug:', {
    token,
    currentTime,
    serverTime: new Date().toISOString()
  });
  
  const result = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 4,
    step: 30,
    time: currentTime
  });
  
  console.log('TOTP Verification Result:', result);
  return result;
};


export const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};
