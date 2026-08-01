require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
const nodemailer = require('nodemailer');

const msg = process.argv[2];
if (!msg) process.exit(0);

const to = process.env.ALERT_EMAIL_TO;
if (!to) {
  console.error('ALERT_EMAIL_TO no configurado en backend/.env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const from = process.env.SMTP_FROM || process.env.SMTP_USER;

transporter
  .sendMail({
    from: `"Watchdog catalogoweb" <${from}>`,
    to,
    subject: 'Alerta del servidor catalogoweb',
    text: `${msg}\n\nEnviado automáticamente por el watchdog de salud.`,
  })
  .then(() => {
    console.log(`[alert-email] enviado a ${to}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('[alert-email] error:', err.message);
    process.exit(1);
  });
