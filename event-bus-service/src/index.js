const express = require("express");
const dotenv = require("dotenv");
const app = express();

// LOAD ENV VARS
dotenv.config({ path: "config/config.env" });

// APP PORT
const Port = process.env.PORT;

// TEST ROUTE
app.get("/api/mcd", (req, res) => {
  res.send("Hello from mcd!");
});

// START SERVER
app.listen(Port, () => {
  console.log(`Server start runing on port ${Port}`);
});
