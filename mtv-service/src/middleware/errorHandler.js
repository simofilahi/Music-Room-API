const errorResponse = require("../helper/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = err;
  console.log(err);
  if (error?.name == "JsonWebTokenError")
    error = new errorResponse({ status: 401, message: "Unauthorized" });
  if (error?.code === 11000)
    error = new errorResponse({ status: 403, message: "Invalid credentials" });

  res.status(error.status || 500).send({
    success: false,
    message: error.message || "Internal error",
  });
};

module.exports = errorHandler;
