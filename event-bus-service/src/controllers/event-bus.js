const asyncHandler = require("../helper/asyncHandler");
const errorResponse = require("../helper/errorResponse");
const axios = require("axios");

// @DESC VERIFY USER IS AUTH
// @ROUTE POST /api/event-bus/auth
// @ACCESS PRIVATE
exports.isAuth = asyncHandler(async (req, res, next) => {
  const config = {
    headers: req.headers,
  };
  console.log(config);

  const data = await axios.get("http://localhost:4004/api/me", config);

  return res.status(200).send({ success: true, data: data });
});
