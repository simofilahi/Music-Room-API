const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const dotenv = require("dotenv");

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// DB CONNECTION
require("./config/connection");

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

// ROUTES
const userRoutes = require("./routes/user");

// ERROR HANDLER MIDDLEWARE
const errorHandler = require("./middleware/errorHandler");

app.use("/api", userRoutes, errorHandler);

// TEST ROUTE
app.get("/api/users", (req, res) => {
  res.send("Hello from users!");
});

module.exports = app;
