const SpotifyWebApi = require("spotify-web-api-node");
const colors = require("colors");

const spotifyWebApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_ID,
});

spotifyWebApi.clientCredentialsGrant().then(
  function (data) {
    console.log({ body: data.body });
    console.log("The access token expires in " + data.body["expires_in"]);
    console.log("The access token is " + data.body["access_token"].red);

    // Save the access token so that it's used in future calls
    spotifyWebApi.setAccessToken(data.body["access_token"]);
  },
  function (err) {
    console.log("Something went wrong when retrieving an access token", err);
  }
);

module.exports = spotifyWebApi;
