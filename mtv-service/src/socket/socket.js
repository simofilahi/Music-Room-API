const Server = require("socket.io").Server;
const EventModel = require("../models/Event");
const mongoose = require("mongoose");
const EventStore = require("../utils/eventStore");
const isAuth = require("./middleware/isAuth");
const fs = require("fs");

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

// RECIEVE INCOMING MESSAGES
const incomingMessage = ({ socket, io }) => {
  socket.on("message", async (data) => {
    try {
      // VARIABLE DESTRUCTION
      const { message, eventId, name } = data;

      // LOOK FOR A EVENT IN DB
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
      io.to(eventId).emit("new message", { message, name });
    } catch {
      // EMIR ERROR MESSAGE
      socket.emit("error", {
        success: false,
        message: "Error occurred please try again",
      });
    }
  });
};

const trackVote = ({ socket, io }) => {
  socket.on("track-vote", async (data) => {
    try {
      // VARIABLE DESTRUCTION
      const { eventId, trackId } = data;

      // LOOK FOR EVENT AND UPDATE VOTE COUNT FOR A TRACK
      let event = await EventModel.findOneAndUpdate(
        { _id: eventId, "playlist.trackId": trackId },
        { $inc: { "playlist.$.vote": 1 } },
        { new: true }
      );

      // VERIFY IF EVENT IS EXIST
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
      io.to(eventId).emit("event-updated", [event]);
    } catch {
      // SEND ERROR MESSAGE
      socket.emit("error", {
        success: false,
        message: "Error occurred please try again",
      });
    }
  });
};

// ADD TRACK TO A EVENT
const addTrack = ({ socket, io }) => {
  socket.on("add-track", async (data) => {
    try {
      // VARIABLE DESTRUCTION
      const { eventId, trackId } = data;

      // GET TRACK INFOS
      const track = await axios.get(
        `${process.env.EVENT_BUS_SERVICE}/api/tracks/${trackId}`
      );

      const trackName = `${trackId}_${Date.now()}.mp3`;
      // TRACK OUTPUT DIRECTORY
      const outputLocationPath = path.join(
        path.dirname(require.main.filename),
        "public",
        "media",
        trackName
      );

      // TRACK URL
      const url = track.data.data.preview_url;

      // DOWNLOAD TRACK
      await downloadFile(url, outputLocationPath);

      // ADD AUDIO PATH TO TRACK OBJECT
      track.data.data.file = `${trackName}.mp3`;

      const { data } = track.data;

      // DON'T FORGOT TO DON'T SAVE DUPLICATE OBJECT
      // ADD TRACK TO EVENT
      const event = await EventModel.findOneAndUpdate(
        { _id: eventId },
        { $addToSet: { playlist: data } },
        { new: true }
      );
      // EMIT DATA TO CLIENTS;
      io.to(eventId).emit("event-updated", event);
    } catch {
      // SEND ERROR MESSAGE
      socket.emit("error", {
        success: false,
        message: "Error occurred please try again",
      });
    }
  });
};

// REMOVE TRACK TO A EVENT
const removeTrack = ({ socket, io }) => {
  socket.on("remove-track", async (data) => {
    try {
      const { eventId, trackId } = data;

      // LOOK FOR EVENT IF IS ALERDAY EXIST
      let event = await EventModel.findOne({ trackId });

      if (event) {
        // TRACK FILE LOCATION
        const filePath = path.join(
          path.dirname(require.main.filename),
          "public",
          "media",
          `${event.file}.mp3`
        );

        // REMOVE FILE
        fs.unlinkSync(filePath);
      } else {
        socket.emit("error", {
          success: false,
          message: "Event not found",
        });
        return;
      }

      // DELETE TRACK FROM DB
      let event = await EventModel.findOneAndUpdate(
        { _id: eventId },
        {
          $pull: {
            playlist: { trackId: trackId },
          },
        },
        { new: true }
      );

      // EMIT DATA TO CLIENTS;
      io.to(eventId).emit("event-updated", [event]);
    } catch {
      socket.emit("error", {
        success: false,
        message: "Error occurred please try again",
      });
    }
  });
};

module.exports = (server) => {
  // CREATE SOCKET SERVER
  io = socketInit(server);

  // LISTENING ON CONNECTION
  io.use(isAuth).on("connection", (socket) => {
    if (socket.client.isAuth) {
      io.emit("authenticated", { success: true, message: "authorized" });
      // JOIN TO CHAT ROOM
      joinToEvent(socket);

      // INCOMING MESSAGE
      incomingMessage({ socket, io });

      // VOTE TO A TRACK
      trackVote({ socket, io });

      // ADD TRACK
      addTrack({ socket, io });

      // REMOVE TRACK
      removeTrack({ socket, io });
    } else {
      io.emit("authenticated", { success: false, message: "unauthorized" });
      socket.disconnect();
    }
  });
};
