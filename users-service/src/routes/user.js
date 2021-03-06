const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const isAuth = require("../middleware/isAuth");
const multer = require("multer");
const saveMedia = require("../middleware/saveMedia");
const upload = multer();

// LOCAL AUTH
router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);

// GOOGLE AUTH
router.post("/auth/google", userController.googleAuth);

// FACEBOOK AUTH
router.post("/auth/facebook", userController.facebookAuth);

// USER INFOS
router.get("/me", isAuth.sessionToken, userController.me);

// SEARCH FOR A  PROFILE
router.get("/users/search", userController.userSearch);

// FIND USER
router.get("/users/:id", isAuth.sessionToken, userController.user);

// UPLOAD PHOTO PROFILE
router.post(
  "/profile/upload",
  isAuth.sessionToken,
  upload.any(),
  saveMedia,
  userController.uploadPhoto
);

// EDIT USER INFOS
router.put("/profile/edit", isAuth.sessionToken, userController.edit);

// MAIL CONFIRMATION
router.post("/email/confirm", isAuth.mailConf, userController.mailConfirmation);

// FORGOT PASSWORD
router.post("/password/forgot", userController.forgotPasswordCode);

// CHANGE PASSWORD BY FORGOT PASSWORD METHODE
router.put("/password/change", userController.changeForgotPass);

// CHANGE PASSWORD IF USER ALERDAY CONNECTED
router.put("/profile/password", isAuth.sessionToken, userController.changePass);

// LOGOUT
router.post("/user/logout", isAuth.sessionToken, userController.logout);

module.exports = router;
