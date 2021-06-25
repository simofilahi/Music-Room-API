const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event");
const authMiddleware = require("../middleware/isAuth");
const accessMiddleware = require("../middleware/access");

// CREATE AN EVENT
router.post("/events", eventController.createEvent);

// UPDATE AN EVENT
router.put("/events/:id", eventController.updateEvent);

// GET EVENTS
router.get(
  "/events",
  // authMiddleware.isAuth,
  // accessMiddleware.access,
  eventController.getEvents
);

// SUBSCRIBE TO AN EVENT
router.post(
  "/events/:id/subscribe",
  // authMiddleware.isAuth,
  // accessMiddleware.access,
  eventController.subscribe
);

// ADD TRACK TO AN EVENT
router.post(
  "/events/:id/track",
  // authMiddleware.isAuth,
  // accessMiddleware.access,
  eventController.addTrack
);

// DELETE TRACK FROM AN EVENT
router.delete(
  "/events/:id/track",
  // authMiddleware.isAuth,
  // accessMiddleware.access,
  eventController.removeTrack
);

// JOIN A EVENT
router.post(
  "/events/:id/join",
  // authMiddleware.isAuth,
  // accessMiddleware.access,
  eventController.joinEvent
);

// STRART EVENT
router.get(
  "/events/:id/start"
  // authMiddleware.isAuth,
  // eventController.startEvent
);

// STREAM TRACK
router.get("/events/:id/tracks/play", eventController.playTrack);

// UPLOAD EVENT PHOTO
router.post("/events/:id/upload", eventController.uploadPhoto);

// GET EVENT PHOTO
router.get("/events/photos/:name", eventController.getPhoto);

module.exports = router;
