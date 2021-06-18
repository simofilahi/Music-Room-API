const nodemailer = require("nodemailer");

nodemailer.createTestAccount((err, account) => {
  console.log(account);
});
