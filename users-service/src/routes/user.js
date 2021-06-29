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
router.get("/me", isAuth.sessionToken, userController.me);

// FIND USER
router.get("/users/:id", isAuth.sessionToken, userController.user);

// UPLOAD PHOTO PROFILE
router.post("/profile/upload", isAuth.sessionToken, userController.uploadPhoto);

// // UPLOAD PHOTO PROFILE
router.get("/profile/:name", userController.getPhoto);

// EDIT USER INFOS
router.put("/user/edit", isAuth.sessionToken, userController.edit);

// MAIL CONFIRMATION
router.post("/email/confirm", isAuth.mailConf, userController.mailConfirmation);

// FORGOT PASSWORD
router.post("/user/password/forgot", userController.forgotPasswordCode);

// CHANGE PASSWORD
router.post("/user/password/change", userController.changePass);

// LOGOUT
router.post("/user/logout", isAuth.sessionToken, userController.logout);

module.exports = router;
