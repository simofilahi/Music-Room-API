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

// SPOTIFY SETUP
require("./config/spotify_config");

// PARSER
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS ALLOW INCOMING REQUEST
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, DELETE, PATCH, OPTIONS"
  );
  next();
});

// HANDLING ERROR MIDDLEWARE
const errorHandler = require("./middleware/errorHandler");

// ROUTERS
const track = require("./routes/track");

// PLAYLIST ROUTE
app.use("/api", track, errorHandler);

// TEST ROUTE
app.get("/api/tracks-service", (req, res) => {
  res.send("Hello from mcd!");
});

// START SERVER
app.listen(Port, () => {
  console.log(`Server start runing on port ${Port}`);
});
