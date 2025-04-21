module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      register: {
        enabled: true,
      },
      email_confirmation: true,
      email_confirmation_redirection: 'http://192.168.78.95:5173/email-confirmation',
    },
  },

  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'mail.yourdomain.com'),
        port: env('SMTP_PORT', 587),
        secure: env('SMTP_SECURE', 'false') === 'true',
        auth: {
          user: env('SMTP_USER', 'your-email@yourdomain.com'),
          pass: env('SMTP_PASS', 'your-email-password'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'your-email@yourdomain.com'),
        defaultReplyTo: env('SMTP_FROM', 'your-email@yourdomain.com'),
        emailConfirmation: {
          redirection: env('URL', 'http://192.168.78.95:5173/email-confirmation'),
        },
      },
    },
  },

  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 10 * 1024 * 1024, 
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },
});