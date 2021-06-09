const User = require("../models/User");
const asyncHandler = require("../helper/asyncHandler");
const errorResponse = require("../helper/errorResponse");
const { OAuth2Client } = require("google-auth-library");
const hashPassword = require("../helper/hashPassword");
const genCode = require("../helper/genCode");
const sendConfirmationEmail = require("../helper/sendEmailConfirmation");

//@DESC REGISTER A USER
//@ROUTE POST /api/auth/register
//@ACCESS PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email, password } = req.body;

  // VERIFY PASSWORD
  if (!password)
    next(new errorResponse({ status: "400", message: "Bad Request" }));

  // GENERATE RANDOM CONFIRMATION CODE
  const code = genCode();

  // CREATE DOC
  const user = new User({
    email,
    password: await hashPassword(password),
    mailConfCode: code,
  });

  // GENRATE TOKEN
  await user.generateToken();

  // SAVE DOC
  const data = await user.save();

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
  await sendConfirmationEmail(message);

  // SEND RESPONSE
  if (data) res.status(201).send({ success: true, data: data });
});

//@DESC LOGIN A USER
//@ROUTE POST /api/auth/login
//@ACCESS PUBLIC
exports.login = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email, password } = req.body;

  // SEARCH FOR USER IN DB
  const user = await User.findOne({ email });

  console.log(user);
  // USER DOESN'T EXIST IN DB
  if (!user)
    next(new errorResponse({ status: "401", message: "Unauthorized" }));

  // VERIFY IS ACTIVE USER
  if (!user.isVerified)
    return next(new errorResponse({ status: "401", message: "Unauthorized" }));

  // VERIFY PASSWORD
  const match = await user.validPassword(password);

  // UNAUTHORIZED IF PASS NOT VALID
  if (!match)
    return next(new errorResponse({ status: "401", message: "pass" }));

  // GENERATE TOKEN
  await user.generateToken();

  // UPDATE STATUS FIELD
  await user.updateOne({ status: "online" });

  // SEND RESPONSE
  if (user) res.status(201).send({ success: true, data: user });
});

//@DESC GET USER INFORAMTIONS
//@ROUTE POST /api/me/
//@ACCESS PRIVATE
exports.me = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { _id } = req.user;

  // SEARCH FOR USER IN DB
  const user = await User.findOne({ _id }).select("-password");

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
    if (data) {
      return res.status(201).send({ success: true });
    }
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
  const { _id } = req.user;

  // UPDATE USER DOC
  const data = await User.updateOne(
    { _id },
    { email, username, password: await hashPassword(password) }
  );

  // ERROR RESPONSE
  if (!data) next(new errorResponse({ success: "", message: "" }));

  // SUCCESS RESPONSE
  res.status(200).send({ success: true, data: data });
});

//@DESC MAIL CONFIRMATION
//@ROUTE POST /api/user/email/confirm
//@ACCESS PRIVATE
exports.mailConfirmation = asyncHandler(async (req, res, next) => {
  // CODE DESTRUCTION
  const { code } = req.body;
  const { _id } = req.user;

  // SEARCH FOR THE OWNER OF CODE
  let user = await User.findOne({ mailConfCode: code, _id });

  // IF USER DOESN'T EXIST
  if (!user)
    return next(new errorResponse({ status: "401", message: "Unauthorized" }));

  // VERIFY CONFIRMATION CODE
  if (user.mailConfCode === code) {
    user = await user.updateOne({
      $set: {
        isVerified: true,
        mailConfCode: null,
        status: "online",
      },
    });
  }

  // SEND RESPONSE
  res.status(200).send({ success: "true", data: user });
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
    next(new errorResponse({ status: "401", message: "Unauthorized" }));

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
  const { _id } = req.user;

  // SEARCH FOR A USER IN DB
  const user = await User.findOne({ _id });

  // IF USER DOESN'T EXIST
  if (!user)
    next(new errorResponse({ status: "401", message: "Unauthorized" }));

  // UPDATE STATUS AND TOKEN
  const data = await user.updateOne({
    $set: { status: "offline", token: null },
  });

  // SEND RESPONSE
  res.status(200).send({ success: "true", data: data });
});
