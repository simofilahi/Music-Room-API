const EventModel = require("../models/Event");
const asyncHandler = require("../helper/asyncHandler");
const ErrorResponse = require("../helper/errorResponse");
const axios = require("axios");
const downloadFile = require("../utils/downloadTrack");
const EventObject = require("../utils/eventObject");
const EventStore = require("../utils/eventStore");
const path = require("path");
const mongoose = require("mongoose");
const uploadPhoto = require("../middleware/upload");

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
    chatRoom: {
      roomId: mongoose.Types.ObjectId(),
    },
  });

  // SAVE DOC
  const data = await event.save();

  console.log(data);
  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

// @DESC CREATE AN EVENT
// @ROUTE GET /api/events
// @ACCESS PRIVATE
exports.getEvents = asyncHandler(async (req, res, next) => {
  // GET EVENTS
  const events = await EventModel.find();

  // VERFIY EXISTANCE OF EVENTS
  if (!events)
    return next(ErrorResponse({ status: 403, message: "no event found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: events });
});

// @DESC UPDATE AN EVENT
// @ROUTE PUT /api/events/:id
// @ACCESS PRIVATE
exports.updateEvent = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { name, desc, musicPreference } = req.body;
  const { id: eventId } = req.params;
  const { id: userId } = req.user;

  // UPDATE EVENT
  const event = await EventModel.findOneAndUpdate(
    { _id: eventId, ownerId: userId },
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
  const { id: eventId } = req.params;
  const { trackId } = req.body;

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

  // ADD AUDIO PATH TO TRACK OBJECT
  track.data.data.file = `${trackId}.mp3`;

  const { data } = track.data;

  // DON'T FORGOT TO DON'T SAVE DUPLICATE OBJECT
  // ADD TRACK TO EVENT
  const event = await EventModel.findOneAndUpdate(
    { _id: eventId },
    { $addToSet: { playlist: data } },
    { new: true }
  );

  // SEND RESPONSE
  res.status(200).send({ status: true, data: event });
});

// @DESC DELETE TRACK TO AN EVENT
// @ROUTE DELETE /api/events/:id/track
// @ACCESS PRIVATE
exports.removeTrack = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: eventId } = req.params;
  const { trackId } = req.body;

  // DELETE TRACK
  const event = await EventModel.findOneAndUpdate(
    { _id: eventId },
    {
      $pull: {
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

// @DESC SUBSCRIBE TO A EVENT
// @ROUTE POST /api/events/:id/subscribe
// @ACCESS PRIVATE
exports.subscribe = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: eventId } = req.params;
  const { _id: userId } = req.user;

  // ADD USER ID TO SUBSCRIBES ARRAY
  const event = await EventModel.findOneAndUpdate(
    { _id: eventId },
    { $addToSet: { subscribes: userId } },
    { new: true }
  );

  // IF EVENT DOESN'T EXIST
  if (!event)
    return next(new ErrorResponse({ status: 404, message: "event not found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: event });
});

// @DESC UNSUBSCRIBE TO A EVENT
// @ROUTE POST /api/events/:id/unsubscribe
// @ACCESS PRIVATE
exports.unsubscribe = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: eventId } = req.params;
  const { _id: userId } = req.user;

  // LOOK FOR EVENT
  const event = await EventModel.findOneAndUpdate(
    { _id: eventId },
    { $pull: { unsubscribes: userId } },
    { new: true }
  );

  // IF EVENT DOESN'T EXIST
  if (!event)
    return next(new ErrorResponse({ status: 404, message: "event not found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: event });
});

// @DESC ENTER AN EVENT
// @ROUTE POST /api/events/:id/join
// @ACCESS PRIVATE
exports.joinEvent = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: eventId } = req.params;

  // ADD USER ID TO SUBSCRIBES ARRAY
  const event = await EventModel.findOneAndUpdate(
    { _id: eventId },
    { $addToSet: { subscribes: userId } },
    { new: true }
  );

  // IF DOESN'T EXIST
  if (!event)
    return next(new ErrorResponse({ status: 404, message: "event not found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: eventDoc });
});

// @DESC START A EVENT
// @ROUTE GET /api/events/:id/start
// @ACCESS PRIVATE
exports.startEvent = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: eventId } = req.params;
  const { id: userId } = req.user;

  // TRACK URL
  const url = `http://${req.get("host")}/api/events/${eventId}/tracks/play`;

  // LOOK FOR EVENT IN DB
  const eventDoc = await EventModel.findOneAndUpdate(
    { _id: eventId, ownerId: userId },
    {
      $set: {
        trackUrl: url,
      },
    },
    { new: true }
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
  res.status(200).send({ success: true, data: eventDoc });
});

// @DESC PLAY A STREAMED TRACK
// @ROUTE GET api/events/:id/track/play
// @ACCESS PRIVATE
exports.playTrack = asyncHandler(async (req, res, next) => {
  const { id: eventId } = req.params;

  // LOOK FOR EVENT IN DB
  const eventDoc = await EventModel.findOne({ _id: eventId });

  if (!eventDoc)
    return next(new ErrorResponse({ status: 404, message: "event not found" }));

  // // SET HEADER TO AUDIO CONTENT
  res.setHeader("Content-Type", "audio/mpeg");

  let index = 0;
  while (index < EventStore.length) {
    if (EventStore[index].eventId == eventId) {
      EventStore[index].addConsumer(res);
      break;
    }
  }
});

//@DESC UPLOAD A PHOTO
//@ROUTE POST /api/events/:id/upload
//@ACCESS PRIVATE
exports.uploadPhoto = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: eventId } = req.params;

  // UPLOAD PHOTO
  await uploadPhoto(req, res);

  // VERIFY FILE
  if (!req.file)
    return res
      .status(400)
      .send({ status: false, message: "please upload a photo" });

  var url = `${req.protocol}://${req.get("host")}/api/events/photos/${
    req.file.filename
  }`;

  // UPDATE PHOTO URL
  const user = await EventModel.findOneAndUpdate(
    { _id: eventId },
    { $set: { image: url } },
    { new: true }
  );

  // VERIFY EXISTANCE OF USER
  if (!user)
    return next(new ErrorResponse({ status: 401, message: "event not found" }));

  // SEND RESPONSE
  res.status(200).send({ succes: true, data: user });
});

//@DESC DOWNLOAD A PHOTO
//@ROUTE GET /api/events/:name
//@ACCESS PUBLIC
exports.getPhoto = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { name: fileName } = req.params;

  // FIND PATH OF PHOTO
  const filePath = path.join(
    path.dirname(require.main.filename),
    "public",
    "uploads",
    fileName
  );

  // SEND FILE
  res.download(filePath, (err) => {
    if (err) {
      res
        .status(500)
        .send({ status: false, message: "File can not be downloaded " });
    }
  });
});
