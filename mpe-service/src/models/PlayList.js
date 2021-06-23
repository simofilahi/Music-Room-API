const mongoose = require("mongoose");
const { Schema } = mongoose;

const playListSchema = new Schema({
  ownerId: mongoose.Types.ObjectId,
  invitedUsers: [mongoose.Types.ObjectId],
  name: {
    type: String,
    required: true,
    minlength: [1, "name should not be less than 1 char"],
    maxlength: [24, "name should not be greater than 24 char"],
  },
  desc: {
    type: String,
    required: true,
    minlength: [1, "desc should not be less than 1 char"],
    maxlength: [255, "desc should not be greater than 24 char"],
  },
  musicPreference: {
    type: Array,
    // enum: ["Pop", "Jaz", "Classical", "Dance"],
  },
  tracks: [
    {
      trackId: { type: String, unique: true },
      name: { type: String },
      artists: { type: Array },
      images: { type: Array },
      preview_url: { type: String },
      popularity: { type: Number },
      order: { type: Number },
    },
  ],
  visbility: {
    type: String,
    enum: ["private", "public"],
    default: "public",
  },
});

module.exports = mongoose.model("PlayList", playListSchema);
