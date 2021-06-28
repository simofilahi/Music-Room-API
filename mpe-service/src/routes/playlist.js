const express = require("express");
const router = express.Router();
const playListController = require("../controllers/playlist");
const authMiddleware = require("../middleware/isAuth");
const accessMiddleware = require("../middleware/access");

// CREATE PLAYLIST
router.post("/playlists", authMiddleware.isAuth, playListController.create);

// GET PLAYLISTS
router.get(
  "/playlists",
  authMiddleware.isAuth,
  accessMiddleware.access,
  playListController.getAll
);

// GET A PLAYLIST
router.get(
  "/playlists/:id",
  authMiddleware.isAuth,
  accessMiddleware.access,
  playListController.getOne
);

// REMOVE PLAYLIST
router.delete(
  "/playlists/:id",
  authMiddleware.isAuth,
  playListController.remove
);

// EDIT PLAYLIST
router.put("/playlists/:id", authMiddleware.isAuth, playListController.edit);

// ADD TRACK TO PLAY LIST
router.post(
  "/playlists/:id/track",
  authMiddleware.isAuth,
  accessMiddleware.access,
  playListController.addTrack
);

// REMOVE TRACK TO PLAY LIST
router.delete(
  "/playlists/:id/track",
  authMiddleware.isAuth,
  accessMiddleware.access,
  playListController.deleteTrack
);

// PLAYLIST INVITED USERS
router.post(
  "/playlists/:id/invite",
  authMiddleware.isAuth,
  playListController.invite
);

// UPLOAD PLAYLIST PHOTO
router.post("/playlists/:id/upload", playListController.uploadPhoto);

// GET PLAYLIST PHOTO
router.get("/playlists/photos/:name", playListController.getPhoto);

module.exports = router;
