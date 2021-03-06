const mongoose = require("mongoose");
const { Schema } = mongoose;

const playListSchema = new Schema({
  ownerId: mongoose.Types.ObjectId,
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
      name: { type: String, required: true },
    },
  ],
  visbility: {
    type: String,
  },
});

module.exports = mongoose.model("PlayList", playListSchema);
