import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      this.logger.error('SENDGRID_API_KEY no está configurado');
      return;
    }
    sgMail.setApiKey(apiKey);
    this.logger.log('SendGrid inicializado correctamente');
  }

  async sendVerificationEmail(to: string, token: string) {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@renai.com',
      subject: 'Verifica tu correo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5e35b1;">Verifica tu correo electrónico</h2>
          <p>Hola,</p>
          <p>Haz clic en el botón para verificar tu correo:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #5e35b1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verificar correo
          </a>
          <p style="color: #666; font-size: 12px;">Si el botón no funciona, copia esta URL en tu navegador:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
          <p style="color: #666; font-size: 12px;">Este enlace expira en 24 horas.</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`Correo de verificación enviado a: ${to}`);
    } catch (error) {
      this.logger.error('Error enviando email:', error);
      throw error;
    }
  }

  async sendResetPasswordEmail(to: string, resetUrl: string) {
    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@renai.com',
      subject: 'Restablece tu contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5e35b1;">Restablece tu contraseña</h2>
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #5e35b1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Restablecer contraseña
          </a>
          <p style="color: #666; font-size: 12px;">Si el botón no funciona, copia esta URL en tu navegador:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #666; font-size: 12px;">Este enlace expira en 1 hora.</p>
          <p style="color: #999; font-size: 11px; margin-top: 30px;">Si no solicitaste este cambio, ignora este correo.</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`Correo de recuperación enviado a: ${to}`);
    } catch (error) {
      this.logger.error('Error enviando email:', error);
      throw error;
    }
  }
}
