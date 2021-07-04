const Server = require("socket.io").Server;
const colors = require("colors");
const EventModel = require("../models/Event");
const mongoose = require("mongoose");
const EventStore = require("../utils/eventStore");

// SOCKET INIT
const socketInit = (server) => {
  return new Server(server, {
    cors: {
      origin: "*",
    },
  });
};

// JOIN A CHAT ROOM
const joinToEvent = (socket) => {
  socket.on("join", (eventId) => {
    socket.join(eventId);
  });
};

// SEND MESSAGE TO ROOM LISTENERS
const sendMessage = ({ io, eventId, message, name }) => {
  io.to(eventId).emit("new message", { message, name });
};

// RECIEVE INCOMING MESSAGES
const incomingMessage = ({ socket, io }) => {
  socket.on("message", async (data) => {
    const { message, eventId, name } = data;
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
    sendMessage({ io, eventId, message, name });
  });
};

const trackVote = ({ socket, io }) => {
  socket.on("track-vote", async (data) => {
    // VARIABLE DESTRUCTION
    const { eventId, trackId } = data;

    // LOOK FOR EVENT AND UPDATE VOTE COUNT FOR A TRACK
    let event = await EventModel.findOneAndUpdate(
      { _id: eventId, "playlist.trackId": trackId },
      { $inc: { "playlist.$.vote": 1 } },
      { new: true }
    );

    if (event) {
      // SORT TRACKS BY VOTE
      const eventDoc = await EventModel.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(eventId) } },
        { $unwind: "$playlist" },
        { $sort: { "playlist.vote": -1 } },
        { $group: { _id: "$_id", playlist: { $push: "$playlist" } } },
      ]);
      event["playlist"] = eventDoc[0].playlist || [];
    }

    // UPATE PLAYLIST IN STREAMING EVENT
    EventStore[eventId].updatePlaylist(event["playlist"]);

    // EMIT DATA TO CLIENTS;
    io.to(eventId).emit("track-vote", [event]);
  });
};

module.exports = (server) => {
  // CREATE SOCKET SERVER
  io = socketInit(server);

  // LISTENING ON CONNECTION
  io.on("connection", (socket) => {
    // JOIN TO CHAT ROOM
    joinToEvent(socket);

    // INCOMING MESSAGE
    incomingMessage({ socket, io });

    // VOTE TO A TRACK
    trackVote({ socket, io });
  });
};
