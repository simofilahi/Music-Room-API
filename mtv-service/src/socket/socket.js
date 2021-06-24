const Server = require("socket.io").Server;
const colors = require("colors");
const EventModel = require("../models/Event");

// SOCKET INIT
const socketInit = (server) => {
  return new Server(server, {
    cors: {
      origin: "*",
    },
  });
};

// JOIN A CHAT ROOM
const joinToChatRoom = (socket) => {
  socket.on("join", (roomId) => {
    socket.join(roomId);
  });
};

// SEND MESSAGE TO ROOM LISTENERS
const sendMessage = ({ io, roomId, message, name }) => {
  io.to(roomId).emit("new message", { message, name });
};

// RECIEVE INCOMING MESSAGES
const incomingMessage = ({ socket, io }) => {
  socket.on("message", async (data) => {
    const { roomId, message, eventId, name } = data;
    const event = await EventModel.findOneAndUpdate(
      {
        _id: eventId,
      },
      {
        $push: { "chatRoom.messages": { message, name } },
      },
      {
        new: true,
      }
    );

    //IF EVENT NOT EXIST
    if (!event) return io.emit("Error", "no event found");

    // SEND MESSAGE TO ALL USERS JOINED IN A ROOM
    sendMessage({ io, roomId, message, name });
  });
};

const trackVote = ({ socket, io }) => {
  socket.on("track-vote", async (data) => {
    const { eventId, trackId } = data;

    const event = await EventModel.update(
      { _id: eventId, "playlist.trackId": trackId },
      { $inc: { "playlist.$.vote": 1 } }
    );

    if (event) {
      const eventDoc = await EventModel.findOne({ _id: eventId }).sort({
        "playlist.vote": "asc",
      });

      console.log(eventDoc);
    }
  });
};

module.exports = (server) => {
  // CREATE SOCKET SERVER
  io = socketInit(server);

  // LISTENING ON CONNECTION
  io.on("connection", (socket) => {
    // JOIN TO CHAT ROOM
    joinToChatRoom(socket);

    // INCOMING MESSAGE
    incomingMessage({ socket, io });

    // VOTE TO A TRACK
    trackVote({ socket, io });
  });
};
