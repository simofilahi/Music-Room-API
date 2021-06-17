const EventModel = require("../models/Event");
const asyncHandler = require("../helper/asyncHandler");
const ErrorResponse = require("../helper/errorResponse");
const spotifyApi = require("../config/spotify_config");
const EventStore = require("../utils/events");
const EventObject = require("../utils/event");
const axios = require("axios");

// @DESC CREATE AN EVENT
// @ROUTE GET /api/events/create
// @ACCESS PRIVATE
exports.createEvent = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { name, desc, musicPreference } = req.body;

  // TEST
  const newPlayList = {
    preview_url:
      "https://p.scdn.co/mp3-preview/daa9eeb950bb499baa931827c55384ea61cf7a6e?cid=774b29d4f13844c495f206cafdad9c86",
  };

  // CREATE NEW EVENT DOC
  const event = new EventModel({
    name,
    desc,
    musicPreference,
    playlist: newPlayList,
  });

  // SAVE DOC
  const data = await event.save();

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data.body });
});

// @DESC START A EVENT
// @ROUTE POST /api/events/start/:id
// @ACCESS PRIVATE
exports.startEvent = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { eventId } = req.body;

  // TRACK URL
  const url = `http://${req.get("host")}/api/events/play/${eventId}`;

  // LOOK FOR EVENT IN DB
  const eventDoc = await EventModel.findOneAndUpdate(
    { _id: eventId },
    {
      $set: {
        trackUrl: url,
      },
    }
  );

  // IF DOESN'T EXIST
  if (!eventDoc)
    return next(new ErrorResponse({ status: 404, message: "event not found" }));

  // CREATE STREAMING OBJECT
  const eventStream = new EventObject(eventId, eventDoc.playlist);

  // START STREAMING
  eventStream.startStreaming();

  // ADD STREMING OBJECT IN ARRAY
  EventStore.push(eventStream);

  // SEND RESPONSE
  res.status(200).send({ success: true });
});

// @DESC ENTER AN EVENT
// @ROUTE POST /api/events/enter/
// @ACCESS PRIVATE
exports.enterEvent = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { eventId } = req.body;

  // LOOK FOR EVENT IN DB
  const eventDoc = await EventModel.findOne({ _id: eventId });

  // IF DOESN'T EXIST
  if (!eventDoc)
    return next(new ErrorResponse({ status: 404, message: "event not found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: eventDoc });
});

// @DESC PLAY A STREAMED TRACK
// @ROUTE GET api/events/play/:id
// @ACCESS PRIVATE
exports.playtracks = asyncHandler(async (req, res, next) => {
  // const { id } = req.params;

  // LOOK FOR EVENT IN DB
  // const event = await EventModel.findOne({ _id: id });

  // SET HEADER TO AUDIO CONTENT
  res.setHeader("Content-Type", "audio/mpeg");

  // console.log();
  EventStore[0].addConsumer(res);
  // console.log(EventStore[0]);
  // for (let ev of EventStore) {
  //   // console.log(event);
  //   if (event.eventId === id) {
  //     // console.log("test");
  //     ev.addConsumer(res);
  //     break;
  //   }
  // }
});
