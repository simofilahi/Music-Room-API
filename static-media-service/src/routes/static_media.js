const express = require("express");
const router = express.Router();
const media = require("../controllers/media");

// UPLOAD A PHOTO
router.post("/media", media.upload);

router.get("/media/:name", media.getMedia);

module.exports = router;
