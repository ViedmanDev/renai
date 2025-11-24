import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config(); // cargar variables de entorno desde .env

async function testMail() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      logger: true,
      debug: true,
    });

    // Verifica la conexión SMTP antes de enviar
    await transporter.verify();
    console.log('✅ Conexión SMTP establecida correctamente');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: 'danicraft.op7@gmail.com',
      subject: 'Prueba de correo',
      text: 'Esto es una prueba de envío de email desde Node/Nodemailer',
    });

    console.log('Mensaje enviado: ', info.messageId);
  } catch (error) {
    console.error('Error enviando correo:', error);
  }
}

testMail();
