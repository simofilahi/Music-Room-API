const userModel = require("../models/User");
const asyncHandler = require("../helper/asyncHandler");
const errorResponse = require("../helper/errorResponse");

//@DESC REGISTER A USER
//@ROUTE POST /api/auth/register
//@ACCESS PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email, password } = req.body;

  // CREATE DOC
  const user = new userModel({
    email,
    password,
  });

  // SAVE DOC
  const data = await user.save();

  // GENERATE JWT

  await data.generateToken();
  // SEND RESPONSE
  if (data) res.status(201).send({ success: true, data: data });
});

exports.login = (req, res, next) => {};

exports.me = (req, res, next) => {
  res.status(200).send({ success: true });
};
