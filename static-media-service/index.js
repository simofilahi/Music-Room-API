const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const dotenv = require("dotenv");

// LOAD ENV VARS
dotenv.config({ path: ".env" });

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
const userRoutes = require("./src/routes/static_media");

// ERROR HANDLER MIDDLEWARE
const errorHandler = require("./src/middleware/errorHandler");

app.use("/api", userRoutes, errorHandler);

// app.post("/api/media", (req, res, next) => {
//   res.send("Yeah");
// });

const Port = process.env.PORT;

// START SERVER
app.listen(Port, () => {
  console.log(`Server start runing on port ${Port}`);
});
