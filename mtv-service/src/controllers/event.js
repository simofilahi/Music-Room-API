const Event = require("../models/event");
const asyncHandler = require("../helper/asyncHandler");
const errorResponse = require("../helper/errorResponse");

exports.createEvent = asyncHandler(async (req, res, next) => {
  const { name, desc } = req.body;

  const event = new Event({
    name,
    desc,
  });

  const data = await event.save();

  res.status(200).send({ success: true, data: data });
});
