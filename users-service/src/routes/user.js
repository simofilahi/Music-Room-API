const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const isAuth = require("../middleware/isAuth");

// LOCAL AUTH
router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);

// GOOGLE AUTH
router.post("/auth/google", userController.googleAuth);

// USER INFOS
router.get("/me", isAuth, userController.me);

// EDIT USER INFOS
router.put("/user/edit", isAuth, userController.edit);

module.exports = router;
