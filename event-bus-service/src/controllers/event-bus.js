const asyncHandler = require("../helper/asyncHandler");
const errorResponse = require("../helper/errorResponse");
const axios = require("axios");

// @DESC VERIFY USER IS AUTH
// @ROUTE GET /api/event-bus/auth
// @ACCESS PRIVATE
exports.isAuth = asyncHandler(async (req, res, next) => {
  // REDIRECT REQ TO USER_SERVICE
  res.redirect(`${process.env.USER_SEVICE}/api/me`);
});

// @DESC VERIFY USER IS EXIST
// @ROUTE GET /api/event-bus/users/:id
// @ACCESS PRIVATE
exports.users = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: userId } = req.params;

  // REDIRECT REQ TO USER_SERVICE
  res.redirect(`${process.env.USER_SEVICE}/api/users/${userId}`);
});

// @DESC GET TRACK INFOS
// @ROUTE GET /api/tracks/:id
// @ACCESS PRIVATE
exports.getTrackInfos = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: trackId } = req.params;

  res.redirect(`${process.env.TRACK_SERVICE}/api/tracks/${trackId}`);
});
