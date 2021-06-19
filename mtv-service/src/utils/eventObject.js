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
  this.currTrackIndex = 0;
  //   event: new EventEmitter(),

  this.addConsumer = function (consumer) {
    this.consumers.push(consumer);
  };

  this.removeConsumer = function (consumer) {
    this.consumers.delete(consumer);
  };

  this.updatePlaylist = function (newPlaylist) {
    this.playlist.shift().push(newPlaylist);
  };

  this.nextTrack = function () {
    if (this.currTrackIndex === this.playlist.length) this.currTrackIndex = 0;
    this.currTrack = path.join(
      path.dirname(require.main.filename),
      "media",
      this.playlist[this.currTrackIndex].file
    );
    this.currTrackIndex++;
    this.playTrack();
  };

  this.getBitRate = async function () {
    try {
      const metadata = await mm.parseFile(this.currTrack);
      return metadata.format.bitrate;
    } catch {
      return 128000;
    }
  };

  this.playTrack = async function () {
    const bitRate = await this.getBitRate();
    const throttle = new Throttle(bitRate / 8);
    const readable = fs.createReadStream(this.currTrack);

    readable.pipe(throttle).on("data", (chunk) => {
      this.broadcast(chunk);
    });

    readable.pipe(throttle).on("end", () => {
      this.nextTrack();
    });
  };

  this.startStreaming = function () {
    this.currTrack = path.join(
      path.dirname(require.main.filename),
      "media",
      this.playlist[this.currTrackIndex].file
    );
    this.currTrackIndex++;
    this.playTrack();
  };

  this.broadcast = function (chunk) {
    for (consumer of this.consumers) {
      consumer.write(chunk);
    }
  };
}

module.exports = Event;
