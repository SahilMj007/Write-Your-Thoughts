import nodemailer from "nodemailer";

export const sendMail = async (email, otp) => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });
  await transport.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Verify Your OTP!",
    html: `
    <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  });
};
