const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendResetEmail(to, resetUrl) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"Catálogo" <${from}>`,
    to,
    subject: 'Recuperación de contraseña',
    text: `Recibiste este correo porque solicitaste restablecer tu contraseña.\n\nHacé clic en el siguiente enlace para crear una nueva contraseña:\n\n${resetUrl}\n\nEste enlace expira en 1 hora.\n\nSi no solicitaste este cambio, ignorá este mensaje.`,
    html: `
      <p>Recibiste este correo porque solicitaste restablecer tu contraseña.</p>
      <p>Hacé clic en el siguiente enlace para crear una nueva contraseña:</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;">Restablecer contraseña</a></p>
      <p style="color:#6b7280;font-size:0.875rem;">Este enlace expira en 1 hora.<br>Si no solicitaste este cambio, ignorá este mensaje.</p>
    `,
  });
}

module.exports = { sendResetEmail };
