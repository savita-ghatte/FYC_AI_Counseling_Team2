import nodemailer from 'nodemailer';

// Uses Ethereal Email for testing purposes (Mock SMTP service)
// In production, this would be configured with AWS SES, SendGrid, etc.
let transporter: nodemailer.Transporter | null = null;

export const initMailer = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Ethereal Email initialized.');
  } catch (err) {
    console.error('Failed to initialize mock email:', err);
  }
};

export const sendMockEmail = async (to: string, subject: string, html: string) => {
  if (!transporter) return;
  try {
    const info = await transporter.sendMail({
      from: '"AI Counsellor Platform" <no-reply@aicounsellor.com>',
      to,
      subject,
      html
    });
    console.log('Preview URL for email sent to ' + to + ': %s', nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error('Error sending email:', err);
  }
};
