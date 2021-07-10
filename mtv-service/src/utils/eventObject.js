const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");
const Throttle = require("throttle");
const mm = require("music-metadata");
const axios = require("axios");
const { throws } = require("assert");
const ffmpeg = require("fluent-ffmpeg");
const { PassThrough, Stream } = require("stream");

function Event(eventId = 0, playlist = []) {
  this.eventId = eventId;
  this.playlist = playlist;
  this.consumers = [];
  this.currTrack = "";
  this.currTrackIndex = 0;
  //   event: new EventEmitter(),

  this.addConsumer = function (consumer) {
    try {
      this.consumers.push(consumer);
    } catch {
      this.startStreaming();
    }
  };

  this.removeConsumer = function (consumer) {
    try {
      this.consumers.delete(consumer);
    } catch {
      this.startStreaming();
    }
  };

  this.updatePlaylist = function (newPlaylist) {
    try {
      this.playlist = newPlaylist;
    } catch {
      this.startStreaming();
    }
  };

  this.nextTrack = function () {
    try {
      if (this.currTrackIndex === this.playlist.length) this.currTrackIndex = 0;
      this.currTrack = path.join(
        path.dirname(require.main.filename),
        "public",
        "media",
        this.playlist[this.currTrackIndex].file
      );
      this.currTrackIndex++;
      this.playTrack();
    } catch {
      this.startStreaming();
    }
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
    try {
      const bitRate = await this.getBitRate();
      const throttle = new Throttle(bitRate / 8);
      const readable = fs.createReadStream(this.currTrack);
      const writeable = new PassThrough();

      // readable.pipe(writeable);
      readable.pipe(throttle);

      throttle.on("data", (chunk) => {
        this.broadcast(chunk);
      });

      throttle.on(
        "end",
        () => {
          setTimeout(() => {
            this.nextTrack();
          });
        },
        1000
      );
      // writeable.on("readable", () => {
      //   setInterval(() => {
      //     const chunk = writeable.read(bitRate / 8);
      //     this.broadcast(chunk);
      //   }, 1000);
      // });

      // writeable.on("end", () => {
      //   setTimeout(() => {
      //     this.nextTrack();
      //   }, 2000);
      // });
      // // readableHighWaterMark = bitRate / 8;

      // const pass = PassThrough();

      // console.log(pass.readableHighWaterMark);
      // pass.on("readable", () => {
      //   // console.log(pass._readableState.length);
      //   const chunk = pass.read(bitRate / 8);
      //   if (chunk) console.log(chunk);
      // });

      // pass.on("pipe", (src) => {});

      // pass.on("data", (chunk) => {
      //   // console.log(chunk.length);
      // });

      // // pass.on("end", () => {
      // //   this.nextTrack();
      // // });

      // readable.pipe(pass);

      // readable.pipe(pass).on("data", (chunk) => {
      //   this.nextTrack();
      // });

      // const pass = new Stream.PassThrough();
      // var end = 0;
      // ffmpeg(this.currTrack)
      //   .format("mp3")
      //   .on("start", function (nextTrack = this.nextTrack, cmd) {
      //     console.log("Started " + cmd);
      //     console.log(nextTrack);
      //   })
      //   .on("error", function (err) {
      //     console.log("An error occurred: " + err.message);
      //   })
      //   .on("end", function (nextTrack = this.nextTrack) {
      //     console.log("Finished encoding");
      //     console.log(nextTrack);
      //     nextTrack();
      //   })
      //   .stream(pass);
      // var end = 0;
      // const run = () => {
      //   let chunk = readable.read(bitRate / 8);

      //   // console.log(end);
      //   // if (!chunk && !end) {
      //   //   end = 1;
      //   // } else if (!chunk && end) {
      //   //   console.log(chunk);
      //   //   end = 0;
      //   //   this.nextTrack();
      //   // }
      //   if (!chunk) this.nextTrack();
      //   this.broadcast(chunk);
      // };
      // setInterval(run, 1000);
    } catch {
      this.startStreaming();
    }
  };

  this.startStreaming = function () {
    try {
      this.currTrack = path.join(
        path.dirname(require.main.filename),
        "public",
        "media",
        this.playlist[this.currTrackIndex].file
      );
      this.currTrackIndex++;
      this.playTrack();
    } catch {
      this.startStreaming();
    }
  };

  this.broadcast = function (chunk) {
    try {
      if (chunk) {
        for (consumer of this.consumers) {
          consumer.write(chunk);
        }
      }
    } catch {
      this.startStreaming();
    }
  };
}

module.exports = Event;
