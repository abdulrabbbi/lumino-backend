// utils/emailService.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export const sendTrialEndingEmail = async (userEmail, userName, trialEndDate, planName) => {
  try {
    const subject = `🚀 Your ${planName} trial ends soon!`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Hi ${userName},</h2>
        <p>Your trial period for the <strong>${planName}</strong> plan ends on 
          <strong>${trialEndDate.toDateString()}</strong>.
        </p>
        <p>After this date, your subscription will automatically continue unless you cancel.</p>
        <p style="margin-top: 20px;">Thank you for using our service!</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject,
      html: htmlContent,
    });

    console.log(`Trial end email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

export const sendSubscriptionChangeEmail = async (userEmail, userName, changeType, message) => {
  try {
    const subject = `📢 Important: Your subscription has changed`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Hi ${userName},</h2>
        <p>${message}</p>
        <p style="margin-top: 20px;">Thank you for your understanding.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject,
      html: htmlContent,
    });

    console.log(`Subscription change email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};
