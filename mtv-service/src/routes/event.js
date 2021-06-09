const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event");

// CREATE A EVENT
router.post("/event/create", eventController.createEvent);

router.get("/event/tracks", eventController.tracks);
// ADD TRACK TO A EVENT
router.post("");

module.exports = router;
