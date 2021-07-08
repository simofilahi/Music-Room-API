const ErrorResponse = require("../../helper/ErrorResponse");
const Event = require("../../models/Event");

hasAccess = async (socket, next) => {
  console.log("ACCESS");
  // VARIABLE DESTRUCTION
  const userId = socket.client.id;
  console.log({ socket: socket.data });
  const { id: eventId } = socket.data;

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
      new ErrorResponse({ status: 403, message: "Forbidden operation" })
    );

  // GO TO NEXT
  next();
};

exports.module = hasAccess;
