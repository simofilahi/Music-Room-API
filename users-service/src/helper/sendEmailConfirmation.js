const nodemailer = require("nodemailer");
const mailConfig = require("../config/nodemailer.config");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const sendConfirmationEmail = (message) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(mailConfig);
    transporter.sendMail(message).then((info) => {
      console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
      resolve("done");
    }).catch(err => {
      console.log(err);
    });
  });
};

module.exports = sendConfirmationEmail;
