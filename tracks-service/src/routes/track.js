const express = require("express");
const router = express.Router();
const trackController = require("../controllers/track");

// GET POPULAR TRACKS
router.get("/tracks/popular", trackController.getPopular);

// SEARCH FOR A TRACK
router.get("/tracks/search", trackController.trackSearch);

// GET TRACK INFOS
router.get("/tracks/:id", trackController.getTrack);

module.exports = router;
