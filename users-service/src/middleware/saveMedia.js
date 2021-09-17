const asyncHandler = require("../helper/asyncHandler");
const axios = require("axios");
const FormData = require("form-data");

const saveMedia = asyncHandler(async (req, res, next) => {
  const { buffer, originalname } = req.files[0];

  //   CREATE FORM DATA;
  const formFile = new FormData();
  formFile.append("file", buffer, originalname);

  const url = `${process.env.EVENT_BUS_SERVICE}/api/media`;

  //   CALL EVENT-BUS ENDPOINT;
  const data = await axios.post(url, formFile, {
    headers: {
      "Content-Type": `multipart/form-data; boundary=${formFile._boundary}`,
    },
  });

  req.media = { url: data.data.url };
  console.log(req.media);
  next();
});

module.exports = saveMedia;
