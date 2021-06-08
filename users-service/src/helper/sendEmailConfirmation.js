const nodemailer = require("nodemailer");
const mailConfig = require("../config/nodemailer.config");

const sendConfirmationEmail = (message) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(mailConfig);
    transporter.sendMail(message).then((info) => {
      console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
      resolve("done");
    });
  });
};

module.exports = sendConfirmationEmail;
