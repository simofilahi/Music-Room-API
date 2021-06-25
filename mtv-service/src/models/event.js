const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  ownersId: [mongoose.Types.ObjectId],
  name: {
    type: String,
    minlength: [1, "name should not be less than 1"],
    maxlength: [24, "name should not be longer than 255 char"],
  },
  desc: {
    type: String,
    maxlength: [255, "Desc should not be longer than 255 char"],
  },
  image: { type: String },
  subscribes: [mongoose.Types.ObjectId],
  unsubscribes: [mongoose.Types.ObjectId],
  musicPreference: {
    type: Array,
    // enum: ["Pop", "Jaz", "Classical", "Dance"],
  },
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
      trackId: { type: String, unique: true },
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
});

module.exports = mongoose.model("Event", eventSchema);
