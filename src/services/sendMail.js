const { createTransporter } = require("../config/mailConfig");

async function sendTestEmail(to, subject, message) {
  const { transporter } = await createTransporter();

  const info = await transporter.sendMail({
    from: `"Code Swipe" <no-reply@codeswipe.com>`,
    to,
    subject,
    text: message,
  });

  console.log("Message sent: %s", info.messageId);
  return info;
}

module.exports = {
  sendTestEmail,
};
