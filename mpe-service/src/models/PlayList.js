const mongoose = require("mongoose");
const { Schema } = mongoose;

const playListSchema = new Schema({
  ownerId: mongoose.Types.ObjectId,
  invitedUsers: [mongoose.Types.ObjectId],
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
  musicPreference: {
    type: Array,
    // enum: ["Pop", "Jaz", "Classical", "Dance"],
  },
  tracks: [
    {
      trackId: { type: String },
      name: { type: String },
      artists: { type: Array },
      images: { type: Array },
      preview_url: { type: String },
      popularity: { type: Number },
      order: { type: Number },
    },
  ],
  visibility: {
    type: String,
    enum: ["private", "public"],
    default: "public",
  },
});

module.exports = mongoose.model("PlayList", playListSchema);
