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

export const verifyToken = (secret, token) => {
  console.log('🔍 Enhanced TOTP Verification:', {
    token: token,
    secretProvided: !!secret,
    secretLength: secret?.length,
    secretValid: secret && /^[A-Z2-7]+=*$/.test(secret),
    currentTime: new Date().toISOString()
  });
  
  if (!secret || !token) {
    console.log('❌ Missing secret or token');
    return false;
  }
  
  // Check if secret is valid base32
  if (!/^[A-Z2-7]+=*$/.test(secret)) {
    console.log('❌ Invalid base32 secret format');
    return false;
  }
  
  // Debug what tokens we expect vs what we received
  const debugResult = debugTOTPSecret(secret, token);
  if (debugResult) {
    console.log('✅ Token matched expected values');
    return true;
  }
  
  // Try original verification as fallback
  try {
    const result = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 10,
      step: 30
    });
    
    console.log(`🔍 Speakeasy verification result: ${result ? '✅ VALID' : '❌ INVALID'}`);
    return result;
  } catch (error) {
    console.log('❌ Verification error:', error.message);
    return false;
  }
};

// Add to your mfaService.js
export const debugTOTPSecret = (secret, token) => {
  console.log('🔍 TOTP Secret Debug:', {
    secretLength: secret?.length,
    secretSample: secret?.substring(0, 8) + '...',
    isValidBase32: /^[A-Z2-7]+=*$/.test(secret),
    tokenReceived: token
  });
  
  // Generate expected tokens for current time and nearby periods
  const currentTime = Math.floor(Date.now() / 1000);
  const expectedTokens = [];
  
  for (let offset = -2; offset <= 2; offset++) {
    const timeStep = Math.floor((currentTime + (offset * 30)) / 30);
    try {
      const expectedToken = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
        time: timeStep * 30
      });
      expectedTokens.push({
        offset: offset * 30,
        timeStep,
        expectedToken
      });
    } catch (error) {
      console.error('❌ Error generating expected token:', error);
    }
  }
  
  console.log('🔍 Expected tokens:', expectedTokens);
  
  return expectedTokens.some(t => t.expectedToken === token);
};

// Add to your mfaController.js
export const debugUserSecret = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.isTwoFactorEnabled) {
      return res.json({
        success: false,
        message: '2FA not enabled for this user'
      });
    }
    
    const secretInfo = {
      hasSecret: !!user.twoFactorSecret,
      secretLength: user.twoFactorSecret?.length,
      secretFormat: user.twoFactorSecret ? 'base32' : 'none',
      isValidBase32: user.twoFactorSecret ? /^[A-Z2-7]+=*$/.test(user.twoFactorSecret) : false,
      secretSample: user.twoFactorSecret?.substring(0, 8) + '...'
    };
    
    console.log('🔍 User secret debug:', secretInfo);
    
    res.json({
      success: true,
      debug: secretInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};
