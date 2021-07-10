const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  ownerId: mongoose.Types.ObjectId,
  name: {
    type: String,
    required: true,
    minLength: [1, "name should not be less than 1 char"],
    maxLength: [24, "name should not be greater than 24 char"],
    unique: [true, "name of playlist must be unique"],
  },
  desc: {
    type: String,
    maxLength: [255, "desc should not be greater than 24 char"],
  },
  image: { type: String },
  subscribes: [mongoose.Types.ObjectId],
  unsubscribes: [mongoose.Types.ObjectId],
  musicPreference: {
    type: Array,
    // enum: ["Pop", "Jaz", "Classical", "Dance"],
  },
  invitedUsers: [mongoose.Types.ObjectId],
  chatRoom: {
    type: Object,
    roomId: mongoose.Types.ObjectId,
    roomUsers: [
      {
        userId: mongoose.Types.ObjectId,
        username: String,
        photo: String,
      },
    ],
    messages: [
      {
        message: String,
        name: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  playlist: [
    {
      artists: Array,
      name: String,
      trackId: { type: String },
      preview_url: String,
      popularity: Number,
      file: String,
      images: [],
      vote: { type: Number, default: 0 },
    },
  ],
  status: {
    type: String,
    enum: ["started", "closed"],
  },
  trackUrl: {
    type: String,
    default: null,
  },
  visibility: {
    type: String,
    enum: ["private", "public"],
    default: "public",
  },
});

module.exports = mongoose.model("Event", eventSchema);
