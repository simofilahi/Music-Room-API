const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event");

// CREATE A EVENT
router.post("/events/create", eventController.createEvent);

router.post("/events/start", eventController.startEvent);

router.post("/events/enter", eventController.enterEvent);

router.get("/events/play/:id", eventController.playtracks);
// GET TRACKS
// router.get("/event/tracks", eventController.tracks);

// // ADD TRACK TO A EVENT PLAYLIST
// router.post("/event/track/:id", eventController.addTrack);

module.exports = router;
