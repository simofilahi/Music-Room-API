const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event-bus.js");

// VERIFY USER IS AUTHENTICATED
router.get("/auth", eventController.isAuth);

// VERIFY USER IF EXIST
router.get("/users/:id", eventController.users);

// GET TRACK INFO
router.get("/tracks/:id", eventController.getTrackInfos);

module.exports = router;
