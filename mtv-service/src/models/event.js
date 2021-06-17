const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  ownerId: mongoose.Types.ObjectId,
  name: {
    type: String,
    minlength: [1, "name should not be less than 1"],
    maxlength: [24, "name should not be longer than 255 char"],
  },
  desc: {
    type: String,
    maxlength: [255, "Desc should not be longer than 255 char"],
  },
  musicPreference: {
    type: Array,
    // enum: ["Pop", "Jaz", "Classical", "Dance"],
  },
  playlist: [
    {
      trackId: String,
      trackName: String,
      preview_url: String,
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
