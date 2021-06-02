const express = require("express");
const dotenv = require("dotenv");
const app = express();
const bodyParser = require("body-parser");

// LOAD ENV VARS
dotenv.config({ path: "config/config.env" });

// APP PORT
const PORT = process.env.PORT;

// DB CONNECTION
require("./config/connection");

// PARSER
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// AUTHENTICATION
require("./config/passport-local");

// ROUTES
const userRoutes = require("./routes/users");

// ERROR HANDLER MIDDLEWARE
const errorHandler = require("./middleware/errorHandler");

app.use("/api", userRoutes, errorHandler);

// TEST ROUTE
app.get("/api/users", (req, res) => {
  res.send("Hello from users!");
});

// START RUNNING SERVER
app.listen(PORT, () => {
  console.log(`Server start runing on port ${PORT}`.yellow);
});
