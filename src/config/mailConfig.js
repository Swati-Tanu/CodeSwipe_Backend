const nodemailer = require("nodemailer");

async function createTransporter() {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_TO,
    },
  });

  return { transporter, testAccount };
}

module.exports = { createTransporter };