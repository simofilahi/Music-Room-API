const Event = require("../models/Event");
const asyncHandler = require("../helper/asyncHandler");
const errorResponse = require("../helper/errorResponse");
const spotifyApi = require("../config/spotify_config");

exports.createEvent = asyncHandler(async (req, res, next) => {
  const { name, desc } = req.body;

  const event = new Event({
    name,
    desc,
  });

  const data = await spotifyApi.getAudioFeaturesForTracks([
    "4iV5W9uYEdYUVa79Axb7Rh",
    "3Qm86XLflmIXVm1wcwkgDK",
  ]);

  // const data = await event.save();

  res.status(200).send({ success: true, data: data.body });
});

exports.track = asyncHandler((req, res, next) => {
  res.status(200).send({ success: true, data: data });
});
