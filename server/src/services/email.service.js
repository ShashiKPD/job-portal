import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Or use SendGrid/Amazon SES
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: `"Job Portal HyrioAI" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    text
  };

  await transporter.sendMail(mailOptions);
};
