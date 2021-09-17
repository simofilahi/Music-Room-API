const Playlist = require("../models/PlayList");
const asyncHandler = require("../helper/asyncHandler");
const axios = require("axios");
const ErrorResponse = require("../helper/ErrorResponse");

// @DESC CREATE A PLAYLIST
// @ROUTE POST /api/playlists
// @ACCESS PRIVATE
exports.create = asyncHandler(async (req, res, next) => {
  // TEST
  const { id: userId } = req.user;

  // VARIABLE DESTRUCTION
  const { name, desc, musicPreference, visibility } = req.body;

  // CREATE DOC
  const playlist = new Playlist({
    name,
    desc,
    musicPreference,
    ownerId: userId,
    visibility,
  });

  // SAVE DOC
  const data = await playlist.save();

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

// @DESC GET PLAYLISTS
// @ROUTE GET /api/playlists
// @ACCESS PUBLIC
exports.getAll = asyncHandler(async (req, res, next) => {
  //   GET PLAYLISTS FROM DB
  const data = await Playlist.find({
    visibility: "public",
  });

  //   SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

// @DESC GET PLAYLISTS
// @ROUTE GET /api/my-playlists
// @ACCESS PRIVATE
exports.getMyPlayList = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  // VARIABLE DESTRUCTION
  const userId = req.user.id;

  //   GET PLAYLISTS FROM DB
  const data = await Playlist.find({
    ownerId: userId,
  });

  //   SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

// @DESC REMOVE A PLAYLIST
// @ROUTE DEL /api/playlists/:id
// @ACCESS PRIVATE
exports.remove = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id } = req.params;
  const { id: userId } = req.user;

  // REMOVE PLAYLIST
  const data = await Playlist.findOneAndRemove({ ownerId: userId, _id: id });

  if (!data)
    return next(
      new ErrorResponse({ status: 403, message: "forbidden operation" })
    );
  // SEND RESPONSE
  res.status(200).send({ success: true });
});

// @DESC EDIT A PLAYLIST
// @ROUTE PUT /api/playlists/:id
// @ACCESS PRIVATE
exports.edit = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { name, desc, musicPreference, visbility } = req.body;
  const { id } = req.params;
  const { id: userId } = req.user;

  // FIND AND UPDTE A PLAYLIST
  const data = await Playlist.findOneAndUpdate(
    { _id: id, ownerId: userId },
    { $set: { name, desc, musicPreference, visbility } },
    { runValidators: true, new: true }
  );

  // IF PLAYLIST NOT FOUND
  if (!data)
    return next(
      new ErrorResponse({ status: 404, message: "Playlist not found" })
    );

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

  // LOOK FOR TRACK IF IS ALLREADY IN THE PLAYLIST TO IGNORE STORING DUPLICATE DATA
  const trackInDb = await Playlist.findOne({
    _id: id,
    "tracks.trackId": trackId,
  });

  // VERIFY IF A TRACK EXIST IN A PLAYLIST
  if (trackInDb)
    return next(
      new ErrorResponse({
        status: 400,
        message: "The track is already in playlist",
      })
    );

  // GET TRACK INFOS
  const track = await axios.get(
    `${process.env.EVENT_BUS_SERVICE}/api/tracks/${trackId}`
  );

  // VERIFY RESPONSE STATUS
  if (track.status !== 200)
    return next(
      new ErrorResponse({ status: track.status, message: track.message })
    );

  const trackInfo = track.data.data;
  // ADD TRACK TO PLAYLIST
  const data = await Playlist.findOneAndUpdate(
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
    },
    {
      new: true,
      runValidators: true,
    }
  );

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

  // GET NEW DOC
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
  const { id: playListId } = req.params;
  const { id: ownerId } = req.user;
  const { userId } = req.body;

  const data = await Playlist.findOne({ _id: playListId });

  if (!data)
    return next(
      new ErrorResponse({ status: 404, message: "playlist not found" })
    );

  if (data.ownerId != ownerId)
    return next(
      new ErrorResponse({ status: 403, message: "operation forbidden" })
    );

  // UPDATE EVENTS
  const playlist = await Playlist.findOneAndUpdate(
    { _id: playListId },
    { $addToSet: { invitedUsers: userId } },
    { new: true }
  );

  // VERIFY EXISTANCE OF PLAYLIST
  if (!playlist)
    return next(ErrorResponse({ status: 404, message: "playlist not found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: playlist });
});

//@DESC UPLOAD A PHOTO
//@ROUTE POST /api/playlists/:id/upload
//@ACCESS PRIVATE
exports.uploadPhoto = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: playListId } = req.params;
  const { id: ownerId } = req.user;
  const { url } = req.media;

  // VERIFY IF THE USER WHO OWNED THE PLAYLIST OR NOT
  const isOwner = await Playlist.findOne({ _id: playListId, ownerId: ownerId });

  if (!isOwner)
    return next(
      new ErrorResponse({ status: 403, message: "forbidden operation" })
    );

  // UPDATE PHOTO URL
  const playlist = await Playlist.findOneAndUpdate(
    { _id: playListId },
    { $set: { image: url } },
    { new: true }
  );

  // VERIFY EXISTANCE OF USER
  if (!playlist)
    return next(
      new ErrorResponse({ status: 401, message: "playlist not found" })
    );

  // SEND RESPONSE
  res.status(200).send({ succes: true, data: playlist });
});
