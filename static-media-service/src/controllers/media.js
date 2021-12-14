const asyncHandler = require("../helper/asyncHandler");
const uploadPhoto = require("../middleware/upload");
const path = require("path");

// @DESC UPLOAD A PHOTO
// @ROUTE POST /api/media/media
// @ACCESS PRIVATE
exports.upload = asyncHandler(async (req, res, next) => {
  // UPLOAD PHOTO
  await uploadPhoto(req, res);

  // VERIFY FILE
  if (!req.file)
    return res
      .status(400)
      .send({ status: false, message: "please upload a photo" });

  const url = `${req.protocol}://${req.headers.host_ip}/api/media/${req.file.filename}`;

  console.log({ url });

  // SEND RESPONSE
  res.status(200).send({ succes: true, url: url });
});

//@DESC DOWNLOAD A PHOTO
//@ROUTE GET /api/media/:name
//@ACCESS PUBLIC
exports.getMedia = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { name: fileName } = req.params;

  // FIND PATH OF PHOTO
  const filePath = path.join(
    path.dirname(require.main.filename),
    "public",
    "uploads",
    fileName
  );

  // SEND FILE
  res.download(filePath, (err) => {
    if (err) {
      res
        .status(500)
        .send({ status: false, message: "File can not be downloaded " });
    }
  });
});
