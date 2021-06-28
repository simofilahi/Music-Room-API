const multer = require("multer");
const util = require("util");
const path = require("path");
const maxSize = 1024 * 1024 * 5;

const storage = multer.diskStorage({
  // FILE STORAGE DESTINATION
  destination: function (req, file, cb) {
    cb(
      null,
      path.join(path.dirname(require.main.filename), "public", "uploads")
    );
  },
  //   FILE NAME AND EXTENTION
  filename: function (req, file, cb) {
    let extname = "";
    if (file.mimetype === "image/png") extname = "png";
    else if (file.mimetype === "image/jpeg") extname = "jpeg";
    else return cb(new Error("File type must be .png or jpeg"));
    cb(null, file.fieldname + "-" + Date.now() + `.${extname}`);
  },
});

const uploadPhoto = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

module.exports = util.promisify(uploadPhoto);
