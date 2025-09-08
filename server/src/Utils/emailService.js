// utils/emailService.js
import nodemailer from "nodemailer";

// Create transporter with better configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add connection validation
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// Verify transporter connection on startup
transporter.verify((error) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email transporter is ready to send messages");
  }
});

export const sendTrialEndingEmail = async (userEmail, userName, trialEndDate, planName, customMessage = null) => {
  try {
    const formattedDate = trialEndDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const daysRemaining = Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24));
    
    const subject = `🚀 Your ${planName} trial ends in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}!`;
    
    // Use custom message if provided, otherwise default message
    const message = customMessage || 
                   "After this date, your subscription will automatically continue unless you cancel.";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; 
                   color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Trial Ending Soon</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Your trial period for the <strong>${planName}</strong> plan ends on:</p>
            <p style="text-align: center; font-size: 18px; font-weight: bold; color: #667eea;">
              ${formattedDate}
            </p>
            <p>That's in <strong>${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}</strong>!</p>
            
            <p>${message}</p>
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/pricing" class="button">
                Manage Subscription
              </a>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Your App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // ... rest of your email sending code
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

export const sendSubscriptionChangeEmail = async (userEmail, userName, changeType, message, additionalInfo = {}) => {
  try {
    const subjectMap = {
      'Yearly to Monthly': '📊 Your subscription has been converted to monthly',
      'Plan Change': '🔄 Your subscription plan has been updated',
      'Payment Issue': '⚠️ Important notice about your subscription',
      'default': '📢 Important: Your subscription has changed'
    };

    const subject = subjectMap[changeType] || subjectMap.default;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #${changeType === 'Payment Issue' ? 'ff6b6b' : '667eea'} 0%, #${changeType === 'Payment Issue' ? 'ee5a52' : '764ba2'} 100%); 
                   color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .info-box { background: #fff; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Update</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            
            <div class="info-box">
              <p>${message}</p>
            </div>

            ${additionalInfo.newPlan ? `
            <p><strong>New Plan:</strong> ${additionalInfo.newPlan}</p>
            ` : ''}

            ${additionalInfo.effectiveDate ? `
            <p><strong>Effective Date:</strong> ${new Date(additionalInfo.effectiveDate).toLocaleDateString()}</p>
            ` : ''}

            ${additionalInfo.nextPayment ? `
            <p><strong>Next Payment:</strong> €${additionalInfo.nextPayment.amount} on ${new Date(additionalInfo.nextPayment.date).toLocaleDateString()}</p>
            ` : ''}

            <p>If you have any questions about this change, please don't hesitate to contact our support team.</p>

            <p>Thank you for your understanding and continued support.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Your App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Hi ${userName},

${message}

${additionalInfo.newPlan ? `New Plan: ${additionalInfo.newPlan}` : ''}
${additionalInfo.effectiveDate ? `Effective Date: ${new Date(additionalInfo.effectiveDate).toLocaleDateString()}` : ''}
${additionalInfo.nextPayment ? `Next Payment: €${additionalInfo.nextPayment.amount} on ${new Date(additionalInfo.nextPayment.date).toLocaleDateString()}` : ''}

If you have any questions about this change, please contact our support team.

Thank you for your understanding.

Best regards,
Your App Team
    `;

    const mailOptions = {
      from: `"Your App Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Subscription change email sent to ${userEmail}`, result.messageId);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

// Additional utility function for general notifications
export const sendGeneralNotification = async (userEmail, userName, subject, message) => {
  try {
    const mailOptions = {
      from: `"Your App Notifications" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">Hi ${userName},</h2>
          <p>${message}</p>
          <p style="margin-top: 20px;">Best regards,<br>Your App Team</p>
        </div>
      `,
      text: `Hi ${userName},\n\n${message}\n\nBest regards,\nYour App Team`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${userEmail}`, result.messageId);
    return true;
  } catch (error) {
    console.error("Notification email error:", error);
    return false;
  }
};