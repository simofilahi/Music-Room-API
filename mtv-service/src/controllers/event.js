const EventModel = require("../models/Event");
const asyncHandler = require("../helper/asyncHandler");
const ErrorResponse = require("../helper/errorResponse");
const spotifyApi = require("../config/spotify_config");
const EventStore = require("../utils/events");
const EventObject = require("../utils/event");
const axios = require("axios");
const downloadFile = require("../utils/downloadTrack");

const path = require("path");

// @DESC CREATE AN EVENT
// @ROUTE GET /api/events
// @ACCESS PRIVATE
exports.createEvent = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { name, desc, musicPreference } = req.body;

  // CREATE NEW EVENT DOC
  const event = new EventModel({
    name,
    desc,
    musicPreference,
  });

  // SAVE DOC
  const data = await event.save();

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data.body });
});

// @DESC UPDATE AN EVENT
// @ROUTE PUT /api/events/:id
// @ACCESS PRIVATE
exports.updateEvent = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { name, desc, musicPreference } = req.body;
  const { id } = req.params;

  // UPDATE EVENT
  const event = await EventModel.findOneAndUpdate(
    { _id },
    {
      $set: {
        name,
        desc,
        musicPreference,
      },
    },
    { new: true }
  );

  // IF EVENT DOESN'T EXIST
  if (!event)
    return next(new ErrorResponse({ status: 404, message: "event not found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: event });
});

// @DESC ADD TRACK TO AN EVENT
// @ROUTE POST /api//events/:id/track
// @ACCESS PRIVATE
exports.addTrack = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { eventId } = req.params;
  const { trackId } = req.body;

  // LOOk FOR EVENT IN DB
  const event = EventModel.findOne({ _id: eventId });

  // IF EVENT DOESN'T EXIST
  if (!event)
    return next(new ErrorResponse({ status: 404, message: "event not found" }));

  // GET TRACK INFORMATIONS (CALL TRACK-SERVICE)
  const track = await axios.get(`http://localhost:4005/api/tracks/${trackId}`);

  // TRACK OUTPUT DIRECTORY
  const outputLocationPath = path.join(
    path.dirname(require.main.filename),
    "/media",
    `${trackId}.mp3`
  );

  // TRACK URL
  const url = track.data.data.preview_url;

  // DOWNLOAD TRACK
  await downloadFile(url, outputLocationPath);
  // ADD TRACK TO EVENT

  // SEND RESPONSE
  res.status(200).send({ status: true, data: [] });
});

// @DESC DELETE TRACK TO AN EVENT
// @ROUTE DELETE /api/events/:id/track
// @ACCESS PRIVATE
exports.removeTrack = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { eventId } = req.params;
  const { trackId } = req.body;

  // DELETE TRACK
  const event = EventModel.findOne(
    { _id: eventId },
    {
      $pullAll: {
        playlist: { _id: trackId },
      },
    },
    { new: true }
  );

  // IF EVENT DOESN'T EXIST
  if (!event)
    return next(new ErrorResponse({ status: 404, message: "event not found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: event });
});

// // @DESC START A EVENT
// // @ROUTE POST /api/events/start/:id
// // @ACCESS PRIVATE
// exports.startEvent = asyncHandler(async (req, res, next) => {
//   // VARIABLE DESTRUCTION
//   const { eventId } = req.body;

//   // TRACK URL
//   const url = `http://${req.get("host")}/api/events/play/${eventId}`;

//   // LOOK FOR EVENT IN DB
//   const eventDoc = await EventModel.findOneAndUpdate(
//     { _id: eventId },
//     {
//       $set: {
//         trackUrl: url,
//       },
//     }
//   );

//   // IF DOESN'T EXIST
//   if (!eventDoc)
//     return next(new ErrorResponse({ status: 404, message: "event not found" }));

//   // CREATE STREAMING OBJECT
//   const eventStream = new EventObject(eventId, eventDoc.playlist);

//   // START STREAMING
//   eventStream.startStreaming();

//   // ADD STREMING OBJECT IN ARRAY
//   EventStore.push(eventStream);

//   // SEND RESPONSE
//   res.status(200).send({ success: true });
// });

// // @DESC ENTER AN EVENT
// // @ROUTE POST /api/events/enter/
// // @ACCESS PRIVATE
// exports.enterEvent = asyncHandler(async (req, res, next) => {
//   // VARIABLE DESTRUCTION
//   const { eventId } = req.body;

//   // LOOK FOR EVENT IN DB
//   const eventDoc = await EventModel.findOne({ _id: eventId });

//   // IF DOESN'T EXIST
//   if (!eventDoc)
//     return next(new ErrorResponse({ status: 404, message: "event not found" }));

//   // SEND RESPONSE
//   res.status(200).send({ success: true, data: eventDoc });
// });

// // // @DESC PLAY A STREAMED TRACK
// // // @ROUTE GET api/events/play/:id
// // // @ACCESS PRIVATE
// // exports.playtracks = asyncHandler(async (req, res, next) => {
// //   const { id } = req.params;
// //   // LOOK FOR EVENT IN DB
// //   // const event = await EventModel.findOne({ _id: id });
// //   // // SET HEADER TO AUDIO CONTENT
// //   // res.setHeader("Content-Type", "audio/mpeg");
// //   // console.log("test");
// //   // EventStore[0].addConsumer(res);
// //   // console.log(EventStore[0]);
// //   for (let ev of EventStore) {
// //     // console.log(event);
// //     if (ev.eventId === id) {
// //       // console.log("test");
// //       ev.addConsumer(res);
// //       break;
// //     }
// //   }
// // });
