const express = require("express");
const dotenv = require("dotenv");
const app = express();

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// APP PORT
const Port = process.env.PORT;

// EVENT BUS ROUTERS
const eventBus = require("./routes/event-bus");

// ERROR HANDLER MIDDLEWARE
const errorHandler = require("./middleware/errorHandler");

// ROUTES FOR HANDLING REQUEST
app.use("api/event-bus", eventBus, errorHandler);

// TEST ROUTE
app.get("/api/event-bus", (req, res) => {
  res.send("Hello from event-bus!");
});

// START SERVER
app.listen(Port, () => {
  console.log(`Server start runing on port ${Port}`);
});
