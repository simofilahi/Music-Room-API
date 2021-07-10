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
  const { name, desc, musicPreference, visibility } = req.body;
  const { id: userId } = req.user;

  // CREATE NEW EVENT DOC
  const event = new EventModel({
    name,
    desc,
    musicPreference,
    chatRoom: {
      roomId: mongoose.Types.ObjectId(),
    },
    visibility,
    ownerId: userId,
  });

  // SAVE DOC
  const data = await event.save();

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

// @DESC CREATE AN EVENT
// @ROUTE GET /api/events
// @ACCESS PRIVATE
exports.getEvents = asyncHandler(async (req, res, next) => {
  // GET EVENTS
  const events = await EventModel.find({ visibility: "public" });

  // VERFIY EXISTANCE OF EVENTS
  if (!events)
    return next(new ErrorResponse({ status: 403, message: "no event found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: events });
});

// @DESC GET MY EVENTS
// @ROUTE GET /api/my-events
// @ACCESS PRIVATE
exports.getMyEvents = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: userId } = req.user;

  //   GET EVENTS FROM DB
  const data = await EventModel.find({
    ownerId: userId,
  });

  // VERFIY EXISTANCE OF EVENTS
  if (!data)
    return next(new ErrorResponse({ status: 403, message: "no event found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

// @DESC UPDATE AN EVENT
// @ROUTE PUT /api/events/:id
// @ACCESS PRIVATE
exports.updateEvent = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { name, desc, musicPreference, visibility } = req.body;
  const { id: eventId } = req.params;
  const { id: userId } = req.user;

  const isOwner = await EventModel.findOne({ _id: eventId, ownerId: userId });

  // VERIFY IF THAT USER HAS ACCESS TO EDIT THIS EVENT
  if (!isOwner)
    return next(
      new ErrorResponse({ status: 403, message: "forbidden operation" })
    );

  // UPDATE EVENT
  const event = await EventModel.findOneAndUpdate(
    { _id: eventId, ownerId: userId },
    {
      $set: {
        name,
        desc,
        musicPreference,
        visibility,
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

// @DESC ADD INVITED USER TO AN EVENT
// @ROUTE POST /api/events/:id/invite
// @ACCESS PRIVATE
exports.invite = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: eventId } = req.params;
  const { id: ownerId } = req.user;
  const { userId } = req.body;

  // LOOK FOR EVENT IF IS IT EXIST IN DB
  const data = await EventModel.findOne({ _id: eventId });

  // VERIFY EVENT IF EXIST OR NOT
  if (!data)
    return next(new ErrorResponse({ status: 404, message: "Event not found" }));

  // VERIFY WHO MADE THE REQUEST IS REALLY WHO OWN THE EVENT
  if (data.ownerId != ownerId)
    return next(
      new ErrorResponse({ status: 403, message: "Operation forbidden" })
    );

  // UPDATE EVENTS
  const event = await EventModel.findOneAndUpdate(
    { _id: eventId },
    { $addToSet: { invitedUsers: userId, subscribes: userId } },
    { new: true }
  );

  // VERIFY EXISTANCE OF EVENT
  if (!event)
    return next(ErrorResponse({ status: 404, message: "Event not found" }));

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

  // GET TRACK INFOS
  const track = await axios.get(
    `${process.env.EVENT_BUS_SERVICE}/api/tracks/${trackId}`
  );

  // TRACK OUTPUT DIRECTORY
  const outputLocationPath = path.join(
    path.dirname(require.main.filename),
    "public",
    "media",
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
        playlist: { trackId: trackId },
      },
    },
    { new: true }
  );

  // IF EVENT DOESN'T EXIST
  if (!event)
    return next(new ErrorResponse({ status: 404, message: "Event not found" }));

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
    return next(new ErrorResponse({ status: 404, message: "Event not found" }));

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
    return next(new ErrorResponse({ status: 404, message: "Event not found" }));

  // SEND RESPONSE
  res.status(200).send({ success: true, data: event });
});

// @DESC START A EVENT
// @ROUTE GET /api/events/:id/start
// @ACCESS PRIVATE
exports.startEvent = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: eventId } = req.params;
  const { id: userId } = req.user;

  console.log(eventId, userId);
  // VERIFY IF THE USER WHO OWNED THE EVENT OR NOT
  const isOwner = await EventModel.findOne({ _id: eventId, ownerId: userId });

  if (!isOwner)
    return next(
      new ErrorResponse({ status: 403, message: "Forbidden operation" })
    );

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
  EventStore[eventId] = eventStream;

  // SEND RESPONSE
  res.status(200).send({ success: true, data: eventDoc });
});

// @DESC GET STREAMED TRACK
// @ROUTE GET api/events/:id/track/play
// @ACCESS PRIVATE
exports.playTrack = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: eventId } = req.params;

  // LOOK FOR EVENT IN DB
  const eventDoc = await EventModel.findOne({ _id: eventId });

  if (!eventDoc)
    return next(new ErrorResponse({ status: 404, message: "event not found" }));

  // // SET HEADER TO AUDIO CONTENT
  res.setHeader("Content-Type", "audio/mpeg");

  EventStore[eventId].addConsumer(res);
});

//@DESC UPLOAD A PHOTO
//@ROUTE POST /api/events/:id/upload
//@ACCESS PRIVATE
exports.uploadPhoto = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: eventId } = req.params;
  const { id: ownerId } = req.user;

  // VERIFY IF THE USER WHO OWNED THE EVENT OR NOT
  const isOwner = await EventModel.findOne({ _id: eventId, ownerId: ownerId });

  if (!isOwner)
    return next(
      new ErrorResponse({ status: 403, message: "Forbidden operation" })
    );

  // UPLOAD PHOTO
  await uploadPhoto(req, res);

  // VERIFY FILE
  if (!req.file)
    return res
      .status(400)
      .send({ status: false, message: "Please upload a photo" });

  var url = `${req.protocol}://${req.get("host")}/api/events/photos/${
    req.file.filename
  }`;

  // UPDATE PHOTO URL
  const event = await EventModel.findOneAndUpdate(
    { _id: eventId },
    { $set: { image: url } },
    { new: true }
  );

  // VERIFY EXISTANCE OF USER
  if (!event)
    return next(new ErrorResponse({ status: 404, message: "Event not found" }));

  // SEND RESPONSE
  res.status(200).send({ succes: true, data: event });
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
