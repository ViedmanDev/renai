import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    // Usar variables de entorno en producción: process.env.SMTP_...
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true', // true para 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Mi App" <no-reply@miapp.com>',
      to,
      subject: 'Verifica tu correo',
      html: `
        <p>Hola,</p>
        <p>Haz clic en el enlace para verificar tu correo:</p>
        <p><a href="${verifyUrl}">Verificar correo</a></p>
        <p>Si el enlace no funciona, pega esta URL en tu navegador:</p>
        <p>${verifyUrl}</p>
        <p>Este enlace expira en 24 horas.</p>
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);
    this.logger.log(`Verification email sent: ${info.messageId}`);
    return info;
  }
}
