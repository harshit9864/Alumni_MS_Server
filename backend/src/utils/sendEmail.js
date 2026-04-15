import nodemailer from "nodemailer";

// Create transporter once and reuse it (more efficient for production)
let transporter = null;

const getTransporter = () => {
  // Verify environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error(
      "Email configuration missing. Set EMAIL_USER and EMAIL_PASS environment variables.",
    );
    throw new Error("Email service not configured");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
      // Production settings for Gmail
      secure: true,
      requireTLS: true,
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  return transporter;
};

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = getTransporter();

    const result = await transporter.sendMail({
      from: `"Mentorship Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      timeout: 10000,
    });

    console.log(
      "Email sent successfully to:",
      to,
      "Message ID:",
      result.messageId,
    );
    return result;
  } catch (error) {
    console.error("Email send error:", {
      to,
      subject,
      errorMessage: error.message,
      errorCode: error.code,
    });
    // Don't throw - just log so it doesn't block the API response
    return null;
  }
};
