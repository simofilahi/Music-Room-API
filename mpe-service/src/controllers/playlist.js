const Playlist = require("../models/Playlist");
const asyncHandler = require("../helper/asyncHandler");

// @DESC CREATE A PLAYLIST
// @ROUTE POST /api/playlist/create
// @ACCESS PRIVATE
exports.create = asyncHandler(async (req, res, next) => {
  // TEST
  req.user = { _id: "60c0a8ed930223041ee45476" };

  // VARIABLE DESTRUCTION
  const { name, desc, musicPreference } = req.body;
  const { _id } = req.user;

  // CREATE DOC
  const playlist = new Playlist({
    name,
    desc,
    musicPreference,
    ownerId: _id,
  });

  // SAVE DOC
  const data = await playlist.save();

  // SEND RESPONCE
  res.status(200).send({ success: true, data: data });
});

// @DESC GET PLAYLISTS
// @ROUTE GET /api/playlists
// @ACCESS PRIVATE
exports.getAll = asyncHandler(async (req, res, next) => {
  //   GET PLAYLISTS FROM DB
  const data = await Playlist.find({});

  //   SEND RESPONCE
  res.status(200).send({ success: true, data: data });
});

// @DESC REMOVE A PLAYLIST
// @ROUTE POST /api/playlist/remove/:id
// @ACCESS PRIVATE
exports.remove = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTINO
  const { id } = req.params;

  // REMOVE PLAYLIST
  const data = await Playlist.findOneAndRemove({ _id: id });

  // SEND RESPONSE
  res.status(200).send({ success: true });
});

// @DESC EDIT A PLAYLIST
// @ROUTE POST /api/playlist/edit/:id
// @ACCESS PRIVATE
exports.edit = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { name, desc, musicPreference } = req.body;
  const { id } = req.params;

  // FIND AND UPDTE A PLAYLIST
  await Playlist.findOneAndUpdate(
    { _id: id },
    { $set: { name, desc, musicPreference } }
  );

  //  GET NEW DOC
  const data = await Playlist.findOne({ _id: id });

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

// @DESC GET A PLAYLIST
// @ROUTE GET /api/playlist/:id
// @ACCESS PRIVATE
exports.getOne = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id } = req.params;

  // GET PLAYLISTS FROM DB
  const data = await Playlist.findOne({ _id: id });

  // SEND RESPONCE
  res.status(200).send({ success: true, data: data });
});
