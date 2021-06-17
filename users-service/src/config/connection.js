const mongoose = require("mongoose");
const colors = require("colors");

// DB URI
const DB_URI = process.env.DB_URI;

console.log(DB_URI);
// DB CONNECTION
const connect = mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Db connected successfuly".green);
  })
  .catch(() => {
    console.log("Db failed to connect".red);
  });

// EXPORT MODULE
module.exports = connect;
