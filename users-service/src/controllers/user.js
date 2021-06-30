const User = require("../models/User");
const asyncHandler = require("../helper/asyncHandler");
const errorResponse = require("../helper/ErrorResponse");
const { OAuth2Client } = require("google-auth-library");
const hashPassword = require("../helper/hashPassword");
const genCode = require("../helper/genCode");
const sendConfirmationEmail = require("../helper/sendEmailConfirmation");
const ErrorResponse = require("../../../mpe-service/src/helper/ErrorResponse");
const uploadPhoto = require("../middleware/upload");
const path = require("path");

//@DESC REGISTER A USER
//@ROUTE POST /api/auth/register
//@ACCESS PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email, password } = req.body;

  // VERIFY PASSWORD
  if (!password || !email)
    return next(
      new errorResponse({
        status: "400",
        message: "Please provide an email and password",
      })
    );

  // GENERATE RANDOM CONFIRMATION CODE
  const code = genCode();

  // CREATE DOC
  const user = new User({
    email,
    password: password,
    mailConfCode: code,
  });

  // GENERATE MAIL CONF TOKEN
  user.mailConfToken = await user.generateMailConfToken();

  // SAVE DOC
  await user.save();

  // MAIL MESSAGE
  const message = {
    from: process.env.EMAIL,
    to: email,
    subject: "Please confirm your account",
    html: `<h1>Email Confirmation</h1>
        <h4>${code}</h4>
        </div>`,
  };

  // SEND VERIFICATION EMAIL
  // await sendConfirmationEmail(message);

  // SEND RESPONSE
  res.status(201).send({ success: true, data: user });
});

//@DESC LOGIN A USER
//@ROUTE POST /api/auth/login
//@ACCESS PUBLIC
exports.login = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email, password } = req.body;

  // SEARCH FOR USER IN DB
  const user = await User.findOne({ email });

  // USER DOESN'T EXIST IN DB
  if (!user)
    return next(
      new errorResponse({ status: "400", message: "Account not found" })
    );

  // VERIFY PASSWORD
  const match = await user.validPassword(password);

  // UNAUTHORIZED IF PASS NOT VALID
  if (!match)
    return next(
      new errorResponse({ status: "400", message: "password incorrect" })
    );

  // VERIFY IS ACTIVE USER
  if (!user.isVerified) {
    const mailConfToken = await user.generateMailConfToken();
    const data = await User.findOneAndUpdate(
      { email },
      { $set: { mailConfToken: mailConfToken } },
      { new: true }
    );
    return res.status(200).send({ success: true, data: data });
  }

  // GENERATE TOKEN
  const token = await user.generateToken();

  // SAVE TOKEN AND UPDATE
  const data = await User.findOneAndUpdate(
    { email },
    {
      $set: { token: token, status: "online" },
    },
    { new: true }
  );

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

//@DESC GET USER INFORAMTIONS
//@ROUTE POST /api/me/
//@ACCESS PRIVATE
exports.me = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: userId } = req.user;

  // SEARCH FOR USER IN DB
  const user = await User.findOne({ _id: userId }).select("-password");

  // SEND RESPONSE
  res.status(200).send({ success: true, data: user });
});

//@DESC REGISTER OR LOGIN A USER BY GOOGLE OAUTH
//@ROUTE POST /api/auth/google
//@ACCESS PUBLIC
exports.googleAuth = asyncHandler(async (req, res, next) => {
  // TOKEN DESTRUCTION
  const { idToken } = req.body;

  // AUTH TO GOOGLE API
  const client = new OAuth2Client(process.env.GOOGLE_CONSUMER_KEY);

  // VERIFY TOKEN
  const ticket = await client.verifyIdToken({ idToken });

  // VARIABLES DESTRUCTION
  const { email, picture } = ticket.getPayload();

  // SEARCH FOR USER IN DB
  const user = await User.findOne({ email });

  // IF USER DOESN'T EXIST
  if (!user) {
    // CREATE A DOC
    const user = User({
      email,
      picture,
    });

    // SAVE DOC
    const data = await user.save();

    // SEND RESPONSE
    if (data) return res.status(201).send({ success: true });
  }

  // GENERATE TOKEN
  await user.generateToken();

  // SEND RESPONSE
  res.status(200).send({ success: true, data: user });
});

//@DESC REGISTER OR LOGIN A USER BY GOOGLE OAUTH
//@ROUTE POST /api/auth/google
//@ACCESS PRIVATE
exports.edit = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email, username, password } = req.body;
  const { id: userId } = req.user;

  // UPDATE USER DOC
  const data = await User.updateOne(
    { _id: userId },
    { email, username, password: await hashPassword(password) }
  );

  // ERROR RESPONSE
  if (!data) return next(new errorResponse({ success: "", message: "" }));

  // SUCCESS RESPONSE
  res.status(200).send({ success: true, data: data });
});

//@DESC MAIL CONFIRMATION
//@ROUTE POST /api/user/email/confirm
//@ACCESS PRIVATE
exports.mailConfirmation = asyncHandler(async (req, res, next) => {
  // CODE DESTRUCTION
  const { code } = req.body;
  const { id: userId } = req.user;

  // SEARCH FOR THE OWNER OF CODE
  let user = await User.findOne({ _id: userId });

  // IF USER DOESN'T EXIST
  if (!user)
    return next(new errorResponse({ status: "401", message: "Unauthorized" }));

  // VERIFY CONFIRMATION CODE
  if (user.mailConfCode === code) {
    // UPDATE DATA
    await user.updateOne({
      $set: {
        isVerified: true,
        mailConfCode: null,
        status: "online",
        mailConfToken: null,
      },
    });

    // GET UPDATED USER DOC
    user = await User.findOne({ _id: userId });

    // SEND RESPONSE
    return res.status(200).send({ success: "true", data: user });
  }

  res
    .status(400)
    .send({ success: true, message: "verfication code is invalid" });
});

//@DESC CHANGE PASSWORD BY FORGOT PASS METHODE
//@ROUTE POST /api/user/password/change
//@ACCESS PUBLIC
exports.changePass = asyncHandler(async (req, res, next) => {
  // CODE DESTRUCTION
  const { code, oldPass, newPass } = req.body;

  // SEARCH FOR THE OWNER OF CODE
  let user = await User.findOne({ forgotPassConfCode: code });

  // HASHPASS
  const match = await user.validPassword(oldPass);

  // UNAUTHORIZED IF PASS NOT VALID
  if (!match)
    return next(new errorResponse({ status: "401", message: "Unauthorized" }));

  // HASH PASS
  const hashedPass = await hashPassword(newPass);

  // UPDATE PASS
  const data = await user.updateOne({
    $set: { password: hashedPass, forgotPassConfCode: null },
  });

  // SEND RESPONSE
  res.status(200).send({ succes: "true", data: data });
});

//@DESC SEND FORGOT PASS TO USER MAIL
//@ROUTE POST /api/user/password/forgot
//@ACCESS PUBLIC
exports.forgotPasswordCode = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email } = req.body;

  // SEARCH FOR EMAIL IN DB
  const user = await User.findOne({ email });

  // IF USER DOESN'T EXIST
  if (!user)
    return next(new errorResponse({ status: "401", message: "Unauthorized" }));

  // GENERATE RANDOM CONFIRMATION CODE
  const code = genCode();

  // UPDATE FORGOT PASS CODE
  await user.updateOne({ $set: { forgotPassConfCode: code } });

  // MAIL MESSAGE
  const message = {
    from: process.env.EMAIL,
    to: email,
    subject: "Forgot password",
    html: `<h1>Forgot Password Confirmation</h1>
        <h4>${code}</h4>
        </div>`,
  };

  // SEND VERIFICATION EMAIL
  await sendConfirmationEmail(message);

  // SEND RESPONSE
  res.status(200).send({ success: "true", data: user });
});

//@DESC LOGOUT
//@ROUTE POST /api/user/logout
//@ACCESS PRIVATE
exports.logout = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: userId } = req.user;

  // SEARCH FOR A USER IN DB
  const user = await User.findOne({ _id: userId });

  // IF USER DOESN'T EXIST
  if (!user)
    return next(new errorResponse({ status: "401", message: "Unauthorized" }));

  // UPDATE STATUS AND TOKEN
  const data = await user.updateOne({
    $set: { status: "offline", token: null },
  });

  // SEND RESPONSE
  res.status(200).send({ success: "true", data: [] });
});

//@DESC LOGOUT
//@ROUTE get /api/users/:id
//@ACCESS PUBLIC
exports.user = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: userId } = req.params;

  // LOOK FOR USER IN DB
  const user = await User.findOne({ _id: userId });

  // VERIFY USER IF NOT EXIST
  if (!user)
    return next(ErrorResponse({ status: 401, message: "user not found" }));

  // SEND RESPONSE
  res.status(200).send({ succes: true, data: user });
});

//@DESC UPLOAD A PHOTO
//@ROUTE POST /api/profile/upload
//@ACCESS PRIVATE
exports.uploadPhoto = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: userId } = req.user;

  // UPLOAD PHOTO
  await uploadPhoto(req, res);

  // VERIFY FILE
  if (!req.file)
    return res
      .status(400)
      .send({ status: false, message: "please upload a photo" });

  var url = `${req.protocol}://${req.get("host")}/api/profile/${
    req.file.filename
  }`;

  // UPDATE PHOTO URL
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { $set: { picture: url } },
    { new: true }
  );

  // VERIFY EXISTANCE OF USER
  if (!user)
    return next(new ErrorResponse({ status: 401, message: "user not found" }));

  // SEND RESPONSE
  res.status(200).send({ succes: true, data: user });
});

//@DESC DOWNLOAD A PHOTO
//@ROUTE GET /api/profile/:name
//@ACCESS PUBLIC
exports.getPhoto = asyncHandler(async (req, res, next) => {
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
