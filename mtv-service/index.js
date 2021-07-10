const express = require("express");
const dotenv = require("dotenv");
const app = express();
const bodyParser = require("body-parser");
const server = require("http").createServer(app);
const cors = require("cors");
// const Events = require("./utils/events");
// const Event = require("./utils/event");

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// APP PORT
const Port = process.env.PORT;

// DB CONNECTION
require("./src/config/connection");

// PARSER
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

// SOCKET
require("./src/socket/socket")(server);

// const ev = new Event();

// ev.startStreaming();
// Events.push(ev);

// ERROR MILDDLEWARE
const errorHandler = require("./src/middleware/errorHandler");

// ROUTERS
const event = require("./src/routes/event");

// EVENT ROUTE
app.use("/api", event, errorHandler);

// TEST ROUTE
app.get("/api/mtv", (req, res) => {
  res.send("Hello from mtv!");
});

// START SERVER
server.listen(Port, () => {
  console.log(`Server start runing on port ${Port}`);
});
