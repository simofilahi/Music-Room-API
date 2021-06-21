const Playlist = require("../models/Playlist");
const asyncHandler = require("../helper/asyncHandler");
const axios = require("axios");
const ErrorResponse = require("../helper/ErrorResponse");

// @DESC CREATE A PLAYLIST
// @ROUTE POST /api/playlists
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

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

// @DESC GET PLAYLISTS
// @ROUTE GET /api/playlists
// @ACCESS PRIVATE
exports.getAll = asyncHandler(async (req, res, next) => {
  //   GET PLAYLISTS FROM DB
  const data = await Playlist.find({});

  //   SEND RESPONSE
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
// @ROUTE PUT /api/playlist/:id
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
// @ROUTE GET /api/playlists/:id
// @ACCESS PRIVATE
exports.getOne = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id } = req.params;

  // GET PLAYLISTS FROM DB
  const data = await Playlist.findOne({ _id: id });

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

// @DESC ADD TRACK TO PLAYLIST
// @ROUTE POST /api/playlists/:id/track
// @ACCESS PRIVATE
exports.addTrack = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id } = req.params;
  const { trackId } = req.body;

  // GET TRACK INFOS
  const track = await axios.get(`http://localhost:4005/api/tracks/${trackId}`);

  // VERIFY RESPONSE STATUS
  if (!track.status)
    return next(new ErrorResponse({ status: 500, message: "internal error" }));

  const trackInfo = track.data.data;

  // ADD TRACK TO PLAYLIST
  await Playlist.updateOne(
    { _id: id },
    {
      $addToSet: {
        tracks: {
          trackId: trackInfo.trackId,
          name: trackInfo.name,
          artists: trackInfo.artists,
          images: trackInfo.images,
          preview_url: trackInfo.preview_url,
          popularity: trackInfo.popularity,
        },
      },
    }
  );

  // GET PLAYLIST
  const data = await Playlist.findById({ _id: id });

  // PLAYLIST DOESN'T EXIST
  if (!data)
    return next(
      new ErrorResponse({ status: 404, message: "Playlilst not found" })
    );

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

// @DESC DELETE TRACKS OF A PLAYLIST
// @ROUTE DELTE /api/playlists/:id/track
// @ACCESS PRIVATE
exports.deleteTrack = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id } = req.params;
  const { trackId } = req.body;

  // DELETE TRACK
  await Playlist.updateOne({ _id: id }, { $pull: { tracks: { trackId } } });

  // GET PLAYLIST DATA
  const data = await Playlist.findOne({ _id: id });

  // PLAYLIST DOESN'T EXIST
  if (!data)
    return next(
      new ErrorResponse({ status: 404, message: "Playlilst not found" })
    );

  // SEND RESPONSE
  res.status(200).send({ succes: true, data: data });
});

// @DESC ADD INVITED USER TO A PLAYLIST
// @ROUTE POST /api/playlists/:id/invite
// @ACCESS PRIVATE
exports.invite = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id } = req.params;
  const { userId } = req.body;

  // ADD TOKEN TO HEADER FOR AUTHORIZATION
  const config = {
    headers: {
      authorization: req.headers.authorization,
    },
  };

  // LOOK FOR USER IF EXSIT
  const user = await axios.get(
    `${process.env.EVENT_BUS_SERVICE}/api/event-bus/users/${userId}`,
    config
  );

  // VERIFY IF USER EXIST
  if (!user.data.succes)
    return next(ErrorResponse({ status: 401, message: "user not found" }));

  // UPDATE EVENTS
  const playlist = await Playlist.findOneAndUpdate(
    { _id: id },
    { $addToSet: { invitedUsers: userId } },
    { new: true }
  );

  // VERIFY EXISTANCE OF PLAYLIST
  if (!playlist)
    return next(ErrorResponse({ status: 401, message: "playlist not found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: playlist });
});
