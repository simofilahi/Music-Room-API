const express = require("express");
const dotenv = require("dotenv");
const app = express();

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// APP PORT
const Port = process.env.PORT;

// TEST ROUTE
app.get("/api/mpe", (req, res) => {
  res.send("Hello from mcd!");
});

// START SERVER
app.listen(Port, () => {
  console.log(`Server start runing on port ${Port}`);
});
