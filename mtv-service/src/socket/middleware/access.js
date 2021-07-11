const ErrorResponse = require("../../helper/ErrorResponse");
const Event = require("../../models/Event");

const hasAccess = async ({ data, socket, next }) => {
  console.log("Hello World!");
  // VARIABLE DESTRUCTION
  const userId = socket.client.id;

  console.log(data);
  const { eventId } = data[1];

  console.log(eventId);
  //   SEARCH FOR PLAYLIST
  const event = await Event.findOne({ _id: eventId });

  console.log("1");
  // IF PLAYLIST DOESN'T EXIST
  if (!event)
    return socket.emit("error", { success: false, message: "Event not found" });

  // IF PLAYLIST VISIBILITY PUBLIC
  if (event.visbility === "public") next();

  // SEARCH FOR A IF ALERDAY IN INVITED USER IN A PLAYLIST
  const eventData = await Event.findOne({
    $or: [{ ownerId: userId }, { invitedUsers: { $in: [userId] } }],
  });

  //   VERIFIY IF DATA NOT EXSIT
  if (!eventData)
    return socket.emit("error", {
      success: false,
      message: "Forbidden operatio",
    });

  // CHECK A USER IF ALERDAY VOTED FOR A TRACK
  if (data[0] === "track-vote") {
    const { trackId } = data[1];

    const userHasAvote = Event.findOne({
      _id: eventId,
      "playlist.trackId": trackId,
      "playlist.vote.users": { $in: [userId] },
    });

    if (!userHasAvote) socket.client.access.push("vote");
  }

  // ADD MESSAGES ACCESS
  socket.client.access.push("messages");
  console.log(socket.client.access);
  // GO TO NEXT
  next();
};

module.exports = hasAccess;
