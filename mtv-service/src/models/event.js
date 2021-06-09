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
});

module.exports = mongoose.model("Event", eventSchema);
