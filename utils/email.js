const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "aa1bf3d78810cf",
      pass: "78fafeee421a3e",
    },
  });

  const mailOption = {
    from : "alimahdavi30000@gmail.com",
    to : option.userEmail,
    subject : option.subject,
    html : option.html,
  }

  await transport.sendMail(mailOption);
};

module.exports = sendEmail;