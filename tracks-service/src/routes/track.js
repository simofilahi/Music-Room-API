const express = require("express");
const router = express.Router();
const trackController = require("../controllers/track");

// GET POPULAR TRACKS
router.get("/tracks/popular", trackController.getPopular);

// GET TRACK INFOS
router.get("/tracks/:id", trackController.getTrack);

module.exports = router;
