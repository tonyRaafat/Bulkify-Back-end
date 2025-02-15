import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true, // Show debug info
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.log("Email service error:", error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});

// Generic email sending function
export const sendEmail = async (email, subject, content) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text: content.text || null,
    html: content.html || null,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

export const sendVerificationEmail = async (email, verifyLink, resendLink) => {
  return sendEmail(email, "Welcome to Bulkify - Verify Your Email", {
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                font-family: 'Arial', sans-serif;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
            }
            .logo {
                color: #4CAF50;
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .content {
                padding: 30px 0;
                line-height: 1.6;
                color: #333333;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
            .button:hover {
                background-color: #45a049;
            }
            .footer {
                text-align: center;
                color: #666666;
                font-size: 12px;
                padding-top: 20px;
                border-top: 1px solid #f0f0f0;
            }
            .resend-link {
                color: #666666;
                text-decoration: underline;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">Bulkify</div>
                <p>Your Bulk Shopping Destination</p>
            </div>
            
            <div class="content">
                <h2>Welcome to Bulkify!</h2>
                <p>Thank you for joining our community. To get started, please verify your email address by clicking the button below:</p>
                
                <center>
                    <a href="${verifyLink}" class="button">Verify Email Address</a>
                </center>
                
                <p>This verification link will expire in 3 minutes for security purposes.</p>
                
                <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; font-size: 14px; color: #666666;">${verifyLink}</p>
                
                <p>Didn't receive the email? <a href="${resendLink}" class="resend-link">Click here to resend verification email</a></p>
            </div>
            
            <div class="footer">
                <p>This email was sent by Bulkify. Please do not reply to this email.</p>
                <p>If you didn't create an account with Bulkify, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} Bulkify. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `,
  });
};

export const sendResendVerificationEmail = async (email, verifyLink) => {
  return sendEmail(email, "Bulkify - New Verification Link", {
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                font-family: 'Arial', sans-serif;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
            }
            .logo {
                color: #4CAF50;
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .content {
                padding: 30px 0;
                line-height: 1.6;
                color: #333333;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
            .button:hover {
                background-color: #45a049;
            }
            .footer {
                text-align: center;
                color: #666666;
                font-size: 12px;
                padding-top: 20px;
                border-top: 1px solid #f0f0f0;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">Bulkify</div>
                <p>Your Bulk Shopping Destination</p>
            </div>
            
            <div class="content">
                <h2>New Verification Link</h2>
                <p>As requested, here's your new verification link. Please click the button below to verify your email address:</p>
                
                <center>
                    <a href="${verifyLink}" class="button">Verify Email Address</a>
                </center>
                
                <p>This new verification link will expire in 3 minutes for security purposes.</p>
                
                <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; font-size: 14px; color: #666666;">${verifyLink}</p>
            </div>
            
            <div class="footer">
                <p>This email was sent by Bulkify. Please do not reply to this email.</p>
                <p>If you didn't request a new verification link, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} Bulkify. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `,
  });
};

// Specific OTP email function
export const sendOTPEmail = async (email, otp) => {
  return sendEmail(email, "Verify Your Account - Bulkify", {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;">
  <h2 style="color: #333; font-weight: bold; margin-bottom: 10px;">Welcome to Bulkify!</h2>
  <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Your verification code is:</p>
  <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px; text-align: center; margin-bottom: 20px;">${otp}</h1>
  <p style="color: #666; font-size: 16px; margin-bottom: 10px;">This code will expire in 10 minutes.</p>
  <p style="color: #666; font-size: 16px; margin-bottom: 20px;">If you didn't request this code, please ignore this email.</p>
  <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Best regards,</p>
  <p style="color: #666; font-size: 16px; margin-bottom: 20px;">The Bulkify Team</p>
</div>
    `,
  });
};
