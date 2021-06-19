const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event");

// CREATE AN EVENT
router.post("/events", eventController.createEvent);

// UPDATE AN EVENT
router.put("/events/:id", eventController.updateEvent);

// GET EVENTS
router.get("/events", eventController.getEvents);

// SUBSCRIBE TO AN EVENT
router.post("/events/:id/subscribe", eventController.subscribe);

// ADD TRACK TO AN EVENT
router.post("/events/:id/track", eventController.addTrack);

// DELETE TRACK FROM AN EVENT
router.delete("/events/:id/track", eventController.removeTrack);

// JOIN A EVENT
router.post("/events/:id/join", eventController.joinEvent);

// STRART EVENT
router.get("/events/:id/start", eventController.startEvent);

// STREAM TRACK
router.get("/events/:id/tracks/play", eventController.playTrack);

module.exports = router;
