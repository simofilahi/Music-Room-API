const asyncHandler = require("../helper/asyncHandler");
const errorResponse = require("../helper/ErrorResponse");
const axios = require("axios");

exports.isAuth = asyncHandler(async (req, res, next) => {
  const config = {
    headers: req.headers,
  };

  console.log(data);
  const data = await axios.get(
    "http://localhost:4000/api/event-bus/auth",
    config
  );

  console.log(data);
  return res.status(200).send({ success: true, data: data });
});
