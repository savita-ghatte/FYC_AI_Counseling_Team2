import nodemailer from 'nodemailer';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[DEVELOPMENT MODE] SMTP credentials missing in .env. OTP not sent via real email.');
      console.log('\n=============================================');
      console.log(`[DEVELOPMENT] OTP for ${to}: ${otp}`);
      console.log('=============================================\n');
      return;
    }

    const mailOptions = {
      from: '"AI Admission Counsellor" <no-reply@aicounsellor.in>',
      to,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
      html: `<b>Your OTP code is: ${otp}</b><br>It will expire in 10 minutes.`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('Error sending email. Falling back to console log:', error);
      console.log('\n=============================================');
      console.log(`[DEVELOPMENT] OTP for ${to}: ${otp}`);
      console.log('=============================================\n');
    }
  }
}

export const emailService = new EmailService();
