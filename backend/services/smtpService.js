export const getSMTPConfig = (smtpSettings) => {
  const { provider, email, password, host, port, secure } = smtpSettings;

  const presetConfigs = {
    gmail: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password
      },
      tls: {
        rejectUnauthorized: false
      }
    },
    yahoo: {
      host: 'smtp.mail.yahoo.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password
      }
    },
    outlook: {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password
      }
    },
    custom: {
      host: host,
      port: port || 587,
      secure: secure || false,
      auth: {
        user: email,
        pass: password
      }
    }
  };

  return presetConfigs[provider] || presetConfigs.custom;
};

export const validateSMTPSettings = async (smtpSettings) => {
  try {
    const config = getSMTPConfig(smtpSettings);
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransporter(config);
    
    await transporter.verify();
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};
