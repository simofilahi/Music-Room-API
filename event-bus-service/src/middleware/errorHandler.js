const ErrorResponse = require("../helper/ErrorResponse");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (error?.message === "File type must be .png or jpeg")
    error = new ErrorResponse({
      status: 400,
      message: "File type must be .png or jpeg",
    });
  if (error?.name == "JsonWebTokenError" || error?.name === "TokenExpiredError")
    error = new ErrorResponse({ status: 401, message: "Unauthorized" });
  if (error?.code === 11000)
    error = new ErrorResponse({ status: 400, message: "Invalid credentials" });
  if (error?.name === "ValidationError")
    error = new ErrorResponse({
      status: 400,
      message: error?.message.split(":")[2],
    });
  res.status(error.status || 500).send({
    success: false,
    message: error.message || "Internal error",
  });
};

module.exports = errorHandler;
