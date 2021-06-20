const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event-bus.js");

// VERIFY USER IS VERIFIED
router.get("/event-bus/auth", eventController.isAuth);

module.exports = router;
