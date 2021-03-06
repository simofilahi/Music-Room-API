const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event");
const authMiddleware = require("../middleware/isAuth");
const accessMiddleware = require("../middleware/access");
const multer = require("multer");
const saveMedia = require("../middleware/saveMedia");
const upload = multer();

// CREATE AN EVENT
router.post("/events", authMiddleware.isAuth, eventController.createEvent);

// GET EVENTS
router.get("/events", authMiddleware.isAuth, eventController.getEvents);

// GET MY EVENTS
router.get("/my-events", authMiddleware.isAuth, eventController.getMyEvents);

// UPDATE AN EVENT
router.put("/events/:id", authMiddleware.isAuth, eventController.updateEvent);

// GET AN EVENT
router.get(
  "/events/:id",
  authMiddleware.isAuth,
  accessMiddleware.access,
  eventController.getOne
);

// REMOVE AN PLAYLIST
router.delete(
  "/events/:id",
  authMiddleware.isAuth,
  eventController.remove
);
// EVENT INVITED USERS
router.post(
  "/events/:id/invite",
  authMiddleware.isAuth,
  eventController.invite
);

// SUBSCRIBE TO A PUBLIC EVENT
router.post(
  "/events/:id/subscribe",
  authMiddleware.isAuth,
  accessMiddleware.access,
  eventController.subscribe
);

// SUBSCRIBE TO A PUBLIC EVENT
router.post(
  "/events/:id/unsubscribe",
  authMiddleware.isAuth,
  accessMiddleware.access,
  eventController.subscribe
);

// ADD TRACK TO AN EVENT
router.post(
  "/events/:id/track",
  authMiddleware.isAuth,
  accessMiddleware.access,
  eventController.addTrack
);

// DELETE TRACK FROM AN EVENT
router.delete(
  "/events/:id/track",
  authMiddleware.isAuth,
  accessMiddleware.access,
  eventController.removeTrack
);

// JOIN A EVENT
router.post(
  "/events/:id/join",
  authMiddleware.isAuth,
  // accessMiddleware.access,
  eventController.joinEvent
);

// STRART EVENT
router.get(
  "/events/:id/start",
  authMiddleware.isAuth,
  eventController.startEvent
);

// STREAM TRACK
router.get("/events/:id/tracks/play", eventController.playTrack);

// UPLOAD EVENT PHOTO
router.post(
  "/events/:id/upload",
  authMiddleware.isAuth,
  upload.any(),
  saveMedia,
  eventController.uploadPhoto
);

module.exports = router;
