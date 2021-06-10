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

// // ADD TRACK TO PLAY LIST
// router.post("/playlist/track/add/:id");
module.exports = router;
