const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const isAuth = require("../middleware/isAuth");

// USER ROUTES
router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);

router.get("/me", isAuth, userController.me);

module.exports = router;
