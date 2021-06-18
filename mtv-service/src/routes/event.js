const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event");

// CREATE AN EVENT
router.post("/events", eventController.createEvent);

// UPDATE AN EVENT
// router.put("/events/:id", eventController.updateEvent);

// GET EVENTS
router.get("/events", eventController.getEvents);

// ADD TRACK TO A EVENT
router.post("/events/:id/track", eventController.addTrack);

// DELETE TRACK FROM A EVENT
router.delete("/events/:id/track", eventController.removeTrack);

// router.post("/events/start", eventController.startEvent);

// router.post("/events/enter", eventController.enterEvent);

// router.get("/events/play/:id", eventController.playtracks);
// GET TRACKS
// router.get("/event/tracks", eventController.tracks);

// // ADD TRACK TO A EVENT PLAYLIST
// router.post("/event/track/:id", eventController.addTrack);

module.exports = router;
