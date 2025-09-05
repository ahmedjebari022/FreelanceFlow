const nodemailer = require("nodemailer");
require('dotenv').config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // App password (not regular password)
  },
});

const sendResetEmail = async (email, token) => {
  const resetUrl = `${
    process.env.CLIENT_URL || "http://localhost:5173"
  }/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Token: ${token}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Email send error:", error);
  }
};

module.exports = { sendResetEmail };
