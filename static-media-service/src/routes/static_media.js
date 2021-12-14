const express = require("express");
const router = express.Router();
const media = require("../controllers/media");

// UPLOAD A PHOTO, TRACK
router.post("/media", media.upload);

// GET A PHOTO, TRACK
router.get("/media/:name", media.getMedia);

module.exports = router;
