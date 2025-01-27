import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: `"Job Portal HyrioAI" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

export const jobAlertTemplate = (job, candidate) => {
  const subject = `Job Alert: ${job.jobTitle} at ${job.createdBy.username})`;
  const htmlContent = `
    <p>Dear ${candidate.email},</p>
    <p>We are excited to inform you about a new job opening:</p>
    <h3>${job.jobTitle}</h3>
    <p><strong>Company:</strong> ${job.createdBy.fullName} (${job.createdBy.email})</p>
    <p><strong>Description:</strong> ${job.jobDescription}</p>
    <p><strong>Experience Level:</strong> ${job.experienceLevel}</p>
    <p><strong>End Date:</strong> ${new Date(job.endDate).toLocaleDateString()}</p>
    <p><a href="job-link">Click here to apply or get more details.</a></p>
    <p>Best regards,</p>
    <p>${job.createdBy.fullName} (Company)</p>
  `;
  return {subject, htmlContent};
};
