const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");
const Throttle = require("throttle");
const mm = require("music-metadata");
const axios = require("axios");
const { throws } = require("assert");

function Event(eventId = 0, playlist = []) {
  this.eventId = eventId;
  this.playlist = playlist;
  this.consumers = [];
  this.currTrack = "";
  //   event: new EventEmitter(),

  this.addConsumer = function (consumer) {
    this.consumers = [...this.consumers, consumer];
  };

  this.removeConsumer = function (consumer) {
    const index = this.consumers.indexOf(consumer);
    delete this.consumers[index];
  };

  this.updatePlaylist = function (newPlaylist) {
    this.playlist.shift().push(newPlaylist);
  };

  this.nextTrack = function () {
    this.currTrack = path.dirname(
      require.main.filename || process.mainModule.filename
    );
    +"/music.mp3";
    this.playTrack();
  };

  this.getBitRate = async function () {
    try {
      const metadata = await mm.parseFile(this.currTrack);
      return parseInt(metadata.format.bitrate);
    } catch {
      return 128000;
    }
  };

  // this.downloadFile = async function () {
  //   return new Promise((resolve, reject) => {

  //   });
  // };

  this.playTrack = async function () {
    // const bitRate = await this.getBitRate();
    // const throttle = new Throttle(bitRate / 8);
    // const readable = fs.createReadStream(this.currTrack);

    // readable.pipe(throttle).on("data", (chunk) => {
    //   this.broadcast(chunk);
    // });

    // readable.pipe(throttle).on("end", () => {
    //   this.nextTrack();
    // });
    console.log(this.playlist[0].preview_url);
    const response = await axios({
      method: "GET",
      url: this.playlist[0].preview_url,
      responseType: "stream",
    })
      .then((response) => {
        console.log(response.data);
        this.broadcast(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  this.startStreaming = function () {
    this.currTrack = path.dirname(require.main.filename) + "/music.mp3";
    this.playTrack();
  };

  this.broadcast = function (data) {
    console.log("***********");
    console.log(data);
    console.log("***********");
    for (consumer of this.consumers) {
      data.pipe(consumer);
    }
  };
}

module.exports = Event;
