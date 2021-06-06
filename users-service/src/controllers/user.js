const User = require("../models/User");
const asyncHandler = require("../helper/asyncHandler");
const errorResponse = require("../helper/errorResponse");
const { OAuth2Client } = require("google-auth-library");

//@DESC REGISTER A USER
//@ROUTE POST /api/auth/register
//@ACCESS PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email, password } = req.body;

  // VERIFY PASSWORD
  if (!password)
    next(new errorResponse({ status: "400", message: "Bad Request" }));

  // CREATE DOC
  const user = new User({
    email,
    password,
  });

  // SAVE DOC
  const data = await user.save();

  // SEND RESPONSE
  if (data) res.status(201).send({ success: true });
});

//@DESC LOGIN A USER
//@ROUTE POST /api/auth/login
//@ACCESS PUBLIC
exports.login = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email, password } = req.body;

  // SEARCH FOR USER IN DB
  const user = await User.findOne({ email });

  // UNAUTHORIZED IF DOESN'T EXIST
  if (!user)
    next(new errorResponse({ status: "401", message: "Unauthorized" }));

  // VERIFY PASSWORD
  const match = await user.validPassword(password);

  // UNAUTHORIZED IF PASS NOT VALID
  if (!match)
    next(new errorResponse({ status: "401", message: "Unauthorized" }));

  // GENERATE TOKEN
  await user.generateToken();

  // SEND RESPONSE
  if (user) res.status(201).send({ success: true, data: user });
});

exports.me = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;

  console.log(_id);
  const user = await User.findOne({ _id }).select("-password");

  res.status(200).send({ success: true, data: user });
});

//@DESC REGISTER OR LOGIN A USER BY GOOGLE OAUTH
//@ROUTE POST /api/auth/google
//@ACCESS PUBLIC
exports.googleAuth = asyncHandler(async (req, res, next) => {
  // TOKEN DESTRUCTION
  const { idToken } = req.body;

  // AUTH TO GOOGLE API
  const client = new OAuth2Client(process.env.GOOGLE_CONSUMER_KEY);

  // VERIFY TOKEN
  const ticket = await client.verifyIdToken({ idToken });

  // VARIABLES DESTRUCTION
  const { email, picture } = ticket.getPayload();

  // SEARCH FOR USER IN DB
  const user = await User.findOne({ email });

  // IF USER DOESN'T EXIST
  if (!user) {
    // CREATE A DOC
    const user = User({
      email,
      picture,
    });

    // SAVE DOC
    const data = await user.save();

    // SEND RESPONSE
    if (data) {
      console.log("test");
      return res.status(201).send({ success: true });
    }
  }

  // GENERATE TOKEN
  await user.generateToken();

  // SEND RESPONSE
  res.status(200).send({ success: true, data: user });
});
