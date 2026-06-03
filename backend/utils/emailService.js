const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
const sendInviteEmail = async ({ email, role, inviteLink, adminName, domain }) => {
  const mailOptions = {
    from: `"InternFlow" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `You're invited to join InternFlow as ${role}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p><strong>${adminName}</strong> has invited you to join <strong>InternFlow</strong> as a <strong>${role.toUpperCase()}</strong>.</p>
            <div class="info-box">
              <strong>📋 Invitation Details:</strong><br>
              Role: <strong>${role}</strong><br>
              Domain: <strong>${domain}</strong><br>
              Invited by: <strong>${adminName}</strong>
            </div>
            <p>Click the button below to accept your invitation and complete your registration:</p>
            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">Accept Invitation</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:<br>
            <a href="${inviteLink}">${inviteLink}</a></p>
            <p style="color: #ef4444; font-weight: 600;">⚠️ This invitation expires in 7 days.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} InternFlow by BPH Technologies<br>
            This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  await transporter.sendMail(mailOptions);
};
module.exports = { sendInviteEmail };