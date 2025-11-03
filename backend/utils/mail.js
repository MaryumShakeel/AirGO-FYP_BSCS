// utils/mail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// -------------------- Mail Transporter Setup --------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mail transporter connection failed!");
    console.error("Error:", error.message);
  } else {
    console.log("✅ Mail transporter is ready to send emails");
  }
});

// -------------------- Function to Send OTP --------------------
export async function sendOTPEmail(to, otp) {
  try {
    console.log("📧 Attempting to send mail via Gmail...");
    console.log("Using account:", process.env.SMTP_EMAIL);
    console.log("Recipient:", to);
    console.log("OTP:", otp);

    const info = await transporter.sendMail({
      from: `"AirGo Lost & Found" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: "Your AirGo OTP Code",
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
      html: `<p>Your OTP is: <b>${otp}</b></p><p>It is valid for 5 minutes.</p>`,
    });

    console.log("✅ MAIL SENT SUCCESSFULLY:");
    console.log("Message ID:", info.messageId);
    return { success: true, info };
  } catch (err) {
    console.error("❌ MAIL SEND FAILED!");
    console.error("Error name:", err.name);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    return { success: false, error: err };
  }
}
