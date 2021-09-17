const asyncHandler = require("../helper/asyncHandler");
const errorResponse = require("../helper/ErrorResponse");
const axios = require("axios");

// @DESC VERIFY USER IS AUTH
// @ROUTE GET /api/event-bus/auth
// @ACCESS PRIVATE
exports.isAuth = asyncHandler(async (req, res, next) => {
  // ADD TOKEN TO HEADER
  const config = {
    headers: {
      authorization: req.headers.authorization,
    },
  };
  const data = await axios.get(`${process.env.USER_SEVICE}/api/me`, config);

  res.status(200).send(data.data);
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
// @ACCESS PUBLIC
exports.getTrackInfos = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: trackId } = req.params;

  res.redirect(`${process.env.TRACK_SERVICE}/api/tracks/${trackId}`);
});

// @DESC UPLOAD PHOTOS
// @ROUTE POST /api/media
// @ACCESS PUBLIC
exports.upload = asyncHandler(async (req, res, next) => {
  console.log("Hello event-bus");
  // console.log({ req });
  const url = `${process.env.SMS_SERVICE}/api/media`;

  res.redirect(307, url);
});
