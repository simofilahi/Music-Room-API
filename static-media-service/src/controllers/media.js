const asyncHandler = require("../helper/asyncHandler");
const uploadPhoto = require("../middleware/upload");

exports.upload = asyncHandler(async (req, res, next) => {
  // UPLOAD PHOTO
  await uploadPhoto(req, res);

  // VERIFY FILE
  if (!req.file)
    return res
      .status(400)
      .send({ status: false, message: "please upload a photo" });

  var url = `${req.protocol}://${req.get("host")}/api/media/${
    req.file.filename
  }`;

  // SEND RESPONSE
  res.status(200).send({ succes: true, data: url });
});
