const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event");

// CREATE A EVENT
router.post("/event/create", eventController.createEvent);

// GET TRACKS
// router.get("/event/tracks", eventController.tracks);

// // ADD TRACK TO A EVENT PLAYLIST
// router.post("/event/track/:id", eventController.addTrack);

module.exports = router;
