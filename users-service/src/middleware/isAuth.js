const jwt = require("jsonwebtoken");
const asyncHandler = require("../helper/asyncHandler");
const User = require("../models/User");
const errorResponse = require("../helper/errorResponse");

// AUTHORIZATION MIDDLEWARE
exports.sessionToken = asyncHandler(async (req, res, next) => {
  // SPLIT TOKEN FROM BEARER
  const token = req.headers.authorization.split(" ")[1];

  // DECODE TOKEN
  const decoded = await jwt.verify(token, process.env.SECRET);

  // SEARCH FOR ID USER IN DB
  const user = await User.findOne({ _id: decoded._id });

  // VERIFIE USER EXISTANCE
  if (!user) next(new errorResponse({ status: 401, message: "Unauthorized" }));

  // MATCH TOKENS
  if (!(user.token === token))
    next(new errorResponse({ status: 401, message: "Unauthorized" }));

  // ADD USER ID TO REQ OBJECT
  req.user = { _id: user._id };
  next();
});

// AUTHORIZATION MIDDLEWARE
exports.mailConf = asyncHandler(async (req, res, next) => {
  // SPLIT TOKEN FROM BEARER
  const token = req.headers.authorization.split(" ")[1];

  // DECODE TOKEN
  const decoded = await jwt.verify(token, process.env.SECRET);

  // SEARCH FOR ID USER IN DB
  const user = await User.findOne({ _id: decoded._id });

  // VERIFIE USER EXISTANCE
  if (!user) next(new errorResponse({ status: 401, message: "Unauthorized" }));

  // MATCH TOKENS
  if (!(user.mailConfToken === token))
    next(new errorResponse({ status: 401, message: "Unauthorized" }));

  // ADD USER ID TO REQ OBJECT
  req.user = { _id: user._id };
  next();
});
