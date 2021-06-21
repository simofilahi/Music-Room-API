const express = require("express");
const router = express.Router();
const playListController = require("../controllers/playlist");
const authController = require("../middleware/isAuth");
const accessController = require("../middleware/access");

// CREATE PLAYLIST
router.post("/playlists", authController.isAuth, playListController.create);

// GET PLAYLISTS
router.get("/playlists", authController.isAuth, playListController.getAll);

// GET A PLAYLIST
router.get("/playlists/:id", authController.isAuth, playListController.getOne);

// REMOVE PLAYLIST
router.delete(
  "/playlists/:id",
  authController.isAuth,
  playListController.remove
);

// EDIT PLAYLIST
router.put("/playlists/:id", authController.isAuth, playListController.edit);

// ADD TRACK TO PLAY LIST
router.post(
  "/playlists/:id/track",
  authController.isAuth,
  accessController.access,
  playListController.addTrack
);

// REMOVE TRACK TO PLAY LIST
router.delete(
  "/playlists/:id/track",
  authController.isAuth,
  accessController.access,
  playListController.deleteTrack
);

// PLAYLIST INVITED USERS
router.post(
  "/playlists/:id/invite",
  authController.isAuth,
  playListController.invite
);

module.exports = router;
