const mongoose = require("mongoose");
const colors = require("colors");

// DB CONNECTION
const connect = mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Db connected successfuly".green);
  })
  .catch((err) => {
    console.log(err);
    console.log("Db failed to connect".red);
  });

// EXPORT MODULE
module.exports = connect;
