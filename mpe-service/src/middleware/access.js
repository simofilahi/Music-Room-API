const asyncHandler = require("../helper/asyncHandler");
const ErrorResponse = require("../helper/ErrorResponse");
const Playlist = require("../models/PlayList");

// CHECK IF USER IS GARANTED TO DO SOME OPERATION
exports.access = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const userId = req.user.id;
  const { id: playlistId } = req.params;

  //   SEARCH FOR PLAYLIST
  const playlist = await Playlist.findOne({ _id: playlistId });

  // IF PLAYLIST DOESN'T EXIST
  if (!playlist)
    return next(
      new ErrorResponse({ status: 401, message: "playlist not found" })
    );

  // IF PLAYLIST VISIBILITY PUBLIC
  if (playlist.visbility === "public") return next();

  // SEARCH FOR A IF ALERDAY IN INVITED USER IN A PLAYLIST
  const data = await Playlist.findOne({
    $or: [{ ownerId: userId }, { invitedUsers: { $in: [userId] } }],
  });

  //   VERIFIY IF DATA NOT EXSIT
  if (!data)
    return next(
      new ErrorResponse({ status: 403, message: "forbidden operation" })
    );

  // GO TO NEXT
  next();
});
