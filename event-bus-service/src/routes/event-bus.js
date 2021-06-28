const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event-bus.js");

// VERIFY USER IS AUTHENTICATED
router.get("/event-bus/auth", eventController.isAuth);

// VERIFY USER IF EXIST
router.get("/event-bus/users/:id", eventController.users);

module.exports = router;
