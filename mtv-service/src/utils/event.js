const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");
const Throttle = require("throttle");
const mm = require("music-metadata");
const axios = require("axios");
const { throws } = require("assert");

function Event(eventId = 0) {
  this.eventId = eventId;
  this.playlist = [];
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
    this.currTrack = path.dirname(require.main.filename) + "/music.mp3";
    this.playTrack();
  };

  this.broadcast = function (chunk) {
    for (consumer of this.consumers) {
      consumer.write(chunk);
    }
  };
}

module.exports = Event;
