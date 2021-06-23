const Server = require("socket.io").Server;
const colors = require("colors");

module.exports = (server) => {
  // CREATE SOCKET SERVER
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  //   LISTENING ON CONNECTION
  io.on("connection", (socket) => {
    io.emit("message", "Hey!");
  });
};
