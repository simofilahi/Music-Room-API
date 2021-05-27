const express = require("express");
const dotenv = require("dotenv");
const app = express();
const axios = require("axios");

// LOAD ENV VARS
dotenv.config({ path: "config/config.env" });

// APP PORT
const Port = process.env.PORT;

// TEST ROUTE
app.get("/api/users", (req, res) => {
  res.send("Hello from users!");
});

// START SERVER
app.listen(Port, () => {
  console.log(`Server start runing on port ${Port}`);
});
