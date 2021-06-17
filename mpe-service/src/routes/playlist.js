const express = require("express");
const router = express.Router();
const playListController = require("../controllers/playlist");

// CREATE PLAYLIST
router.post("/playlist/create", playListController.create);

// GET PLAYLISTS
router.get("/playlists", playListController.getAll);

// GET A PLAYLIST
router.get("/playlist/:id", playListController.getOne);

// REMOVE PLAYLIST
router.post("/playlist/remove/:id", playListController.remove);

// EDIT PLAYLIST
router.post("/playlist/edit/:id", playListController.edit);

// ADD TRACK TO PLAY LIST
router.post("/playlists/:id/track", playListController.addTrack);

// REMOVE TRACK TO PLAY LIST
router.delete("/playlists/:id/track", playListController.deleteTrack);

// // GET TRACK IN A PLAYLIST
// router.GET("/playlists/:id/tracks", playListController.getTracksInPlayList);
module.exports = router;
