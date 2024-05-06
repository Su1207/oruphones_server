import nodemailer from "nodemailer";

// Function to send email
export const sendEmail = async (recipientEmail: string) => {
  // Configure Nodemailer with your email service provider details
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your_email@gmail.com",
      pass: "your_password",
    },
  });

  // Construct the email message
  const mailOptions = {
    from: "your_email@gmail.com",
    to: recipientEmail,
    subject: "Successful Login",
    text: "You have successfully logged in to our application.",
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return "Email sent successfully";
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
