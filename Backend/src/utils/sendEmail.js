import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Create test or real transporter
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Fallback for development: use Ethereal fake SMTP or direct console log mode
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: '"ERP SaaS Manufacturing Portal" <no-reply@saaserp.com>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent to ${to}]: ${info.messageId}`);
    
    // If using Ethereal test account, log preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Ethereal Preview URL]: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`[Email Sending Error]:`, error.message);
    // Log fallback secure link directly to console for instant testing
    console.log(`[Console Fallback Email Delivery to ${to}]: Content:\n${text || html}`);
    return { success: false, error: error.message };
  }
};
