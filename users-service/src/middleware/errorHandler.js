const errorResponse = require("../helper/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = err;

  // console.log({ error });
  if (error?.name == "JsonWebTokenError")
    error = new errorResponse({ status: 401, message: "Unauthorized" });
  if (error?.code === 11000)
    error = new errorResponse({ status: 400, message: "Invalid credentials" });
  if (error?._message === "User validation failed")
    error = new errorResponse({
      status: 400,
      message: error?.message.split(":")[2],
    });
  res.status(error.status || 500).send({
    success: false,
    message: error.message || "Internal error",
  });
};

module.exports = errorHandler;
