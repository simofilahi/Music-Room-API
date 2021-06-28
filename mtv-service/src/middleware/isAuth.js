const asyncHandler = require("../helper/asyncHandler");
const axios = require("axios");

exports.isAuth = asyncHandler(async (req, res, next) => {
  // ADD TOKEN TO HEADER
  const config = {
    headers: {
      authorization: req.headers.authorization,
    },
  };

  // HTTP CALL TO VERIFY AUTH
  const data = await axios.get(
    `${process.env.EVENT_BUS_SERVICE}/api/event-bus/auth`,
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
