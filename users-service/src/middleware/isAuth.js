const jwt = require("jsonwebtoken");
const asyncHandler = require("../helper/asyncHandler");
const User = require("../models/User");
const errorResponse = require("../helper/errorResponse");

// AUTHORIZATION MIDDLEWARE
const isAuth = asyncHandler(async (req, res, next) => {
  // SPLIT TOKEN FROM BEARER
  const token = req.headers.authorization.split(" ")[1];

  // DECODE TOKEN
  const decoded = await jwt.verify(token, process.env.SECRET);

  // SEARCH FOR ID USER IN DB
  const user = await User.findOne({ _id: decoded._id });

  // VERIFIE USER EXISTANCE
  if (!user) next(new errorResponse({ status: 401, message: "Unauthorized" }));

  // ADD USER ID TO REQ OBJECT
  req.user = { _id: user._id };
  console.log(req.user._id);
  next();
});

module.exports = isAuth;
