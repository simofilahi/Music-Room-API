const Playlist = require("../models/track");
const asyncHandler = require("../helper/asyncHandler");
const axios = require("axios");
const spotifyApi = require("../config/spotify_config");

// @DESC GET POPULAR TRACKS
// @ROUTE GET /api/tracks/popular
// @ACCESS PRIVATE
exports.getPopular = asyncHandler(async (req, res, next) => {
  // GET POPULAR PLAYLIST
  const popularPlaylist = await spotifyApi.searchPlaylists("popular");

  // URL OF THE FIRST PLAYLIST TRACKS
  const url = popularPlaylist.body.playlists.items[0].tracks.href;

  // GET TRACKS
  const tracks = await axios.get(url, {
    headers: {
      authorization: `Bearer ${spotifyApi.getAccessToken()}`,
    },
  });

  // HANDLE DATA
  const data = tracks.data.items
    .map((item) => {
      if (item.track.preview_url)
        return {
          artists: item.track.artists,
          preview_url: item.track.preview_url,
          name: item.track.name,
          images: item.track.album.images,
          trakId: item.track.id,
          popularity: item.track.popularity,
        };
    })
    .filter((item) => item);

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

// @DESC GET TRACK INFORMATIONS
// @ROUTE GET /api/tracks/:id
// @ACCESS PRIVATE
exports.getTrack = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id } = req.params;

  // GET TRACK
  const track = await spotifyApi.getTrack(id);

  // DATA HANDLING
  const data = {
    artists: track.body.artists,
    preview_url: track.body.preview_url,
    name: track.body.name,
    images: track.body.album.images,
    trackId: track.body.id,
    popularity: track.body.popularity,
  };

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});
