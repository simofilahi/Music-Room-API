const jwt = require("jsonwebtoken");
const asyncHandler = require("../helper/asyncHandler");
const User = require("../models/User");
const ErrorResponse = require("../helper/ErrorResponse");

// AUTHORIZATION MIDDLEWARE
exports.sessionToken = asyncHandler(async (req, res, next) => {
  // VERIFY AUTHORIZATION HEADER TOKEN IF IT'S FOUND

  if (!req.headers.authorization)
    return next(
      new ErrorResponse({ status: 400, message: "No token provided" })
    );
  // SPLIT TOKEN FROM BEARER
  const token = req.headers.authorization.split(" ")[1];

  // DECODE TOKEN
  const decoded = await jwt.verify(token, process.env.SECRET);

  // SEARCH FOR ID USER IN DB
  const user = await User.findOne({ _id: decoded._id });

  // VERIFIE USER EXISTANCE
  if (!user)
    return next(new ErrorResponse({ status: 401, message: "Unauthorized" }));

  // MATCH TOKENS
  if (!(user.token === token))
    return next(new ErrorResponse({ status: 401, message: "Unauthorized" }));

  // ADD USER ID TO REQ OBJECT
  req.user = { id: user._id };
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

  // VERIFIE USER
  if (!user)
    return next(new ErrorResponse({ status: 401, message: "Unauthorized" }));

  // MATCH TOKENS
  if (!(user.mailConfToken === token))
    return next(new ErrorResponse({ status: 401, message: "Unauthorized" }));

  // ADD USER ID TO REQ OBJECT
  req.user = { id: user._id };
  next();
});
