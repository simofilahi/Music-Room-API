const multer = require("multer");
const util = require("util");
const path = require("path");
const maxSize = 1024 * 1024 * 5;

const storage = multer.diskStorage({
  // FILE STORAGE DESTINATION
  destination: function (req, file, cb) {
    const dirPath = path.join(
      path.dirname(require.main.filename),
      "public",
      "uploads"
    );
    cb(null, dirPath);
  },
  //   FILE NAME AND EXTENTION
  filename: function (req, file, cb) {
    let extname = "";
    if (file.mimetype === "image/png") extname = "png";
    else if (file.mimetype === "image/jpeg") extname = "jpeg";
    else if (file.mimetype === "image/jpg") extname = "jpg";
    else return cb(new Error("File type must be .png or jpeg or jpg"));
    cb(null, file.fieldname + "-" + Date.now() + `.${extname}`);
  },
});

const uploadPhoto = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

module.exports = util.promisify(uploadPhoto);
