const express = require("express");
const dotenv = require("dotenv");
const app = express();
const bodyParser = require("body-parser");

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// APP PORT
const Port = process.env.PORT;

// DB CONNECTION
require("./config/connection");

// PARSER
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// HANDLING ERROR MIDDLEWARE
const errorHandler = require("./middleware/errorHandler");

// ROUTERS
const playList = require("./routes/playlist");

// PLAYLIST ROUTE
app.use("/api", playList, errorHandler);

// TEST ROUTE
app.get("/api/mpe", (req, res) => {
  res.send("Hello from mcd!");
});

// START SERVER
app.listen(Port, () => {
  console.log(`Server start runing on port ${Port}`);
});
