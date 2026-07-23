import nodemailer from 'nodemailer';

export class EmailService {
  private transporter;

  constructor() {
    // For development, we're using Ethereal Email (a dummy SMTP service)
    // In production, replace this with SES, SendGrid, or Gmail
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'mylene.will26@ethereal.email', // Replace with dynamic ethereal or real credentials if desired
        pass: '6u9aV9uQnKxTtzV2B9',
      },
    });
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
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
