const asyncHandler = require("../helper/asyncHandler");
const ErrorResponse = require("../helper/ErrorResponse");
const Event = require("../models/Event");

// CHECK IF USER IS GARANTED TO DO SOME OPERATION
exports.access = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const userId = req.user.id;
  const { id: eventId } = req.params;

  //   SEARCH FOR PLAYLIST
  const event = await Event.findOne({ _id: eventId });

  // IF PLAYLIST DOESN'T EXIST
  if (!event)
    return next(new ErrorResponse({ status: 401, message: "event not found" }));

  // IF PLAYLIST VISIBILITY PUBLIC
  if (event.visbility === "public") return next();

  // SEARCH FOR A IF ALERDAY IN INVITED USER IN A PLAYLIST
  const data = await Event.findOne({
    $or: [{ ownerId: userId }, { invitedUsers: { $in: [userId] } }],
  });

  //   VERIFIY IF DATA NOT EXSIT
  if (!data)
    return next(
      new ErrorResponse({ status: 403, message: "forbidden operation" })
    );

  // GO TO NEXT
  next();
});
