const asyncHandler = require("../helper/asyncHandler");
const errorResponse = require("../helper/ErrorResponse");
const axios = require("axios");
const colors = require("colors");

exports.isAuth = asyncHandler(async (req, res, next) => {
  console.log("AUTH".green);
  // ADD TOKEN TO HEADER
  const config = {
    headers: {
      authorization: req.headers.authorization,
    },
  };

  // HTTP CALL TO VERIFY AUTH
  const data = await axios.get(
    `${process.env.EVENT_BUS_SERVICE}/api/auth`,
    config
  );

  // VERIFY RESPONSE
  if (data.data.success) {
    req.user = { id: data.data.data._id };
    return next();
  }

  // IF THE USER DOESN'T AUTHENICATED
  res.status(401).send({ success: false, message: "Unauthorized" });
});
