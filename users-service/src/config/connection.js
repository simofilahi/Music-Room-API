const mongoose = require("mongoose");
const colors = require("colors");

const dotenv = require("dotenv");

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// DB URI
const DB_URI = process.env.DB_URI;

console.log(DB_URI);
// DB CONNECTION
const connect = mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(`db failed to connect ${err}`);
  });

// DB DISCONNECT
const disconnect = async () => {
  return await mongoose.connection.close();
};

// EXPORT MODULE
module.exports = connect;
