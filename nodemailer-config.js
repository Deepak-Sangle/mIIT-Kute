const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.ADMIN_GMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
});

function sendConfirmationEmail(name, email, confirmationCode) {
    console.log(confirmationCode);
  transport
    .sendMail({
      from: process.env.ADMIN_GMAIL,
      to: email,
      subject: "Please confirm your mIITK-KUTE account",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for Registering in mIIT-KUTE App. Please confirm your email by copying the following link and pasting it in your browser</p>
          http://localhost:3000/api/auth/confirm/${confirmationCode}
          </div>`,
    })
    .catch((err) => console.log(err));
};

module.exports = sendConfirmationEmail;