const User = require("../models/User");
const asyncHandler = require("../helper/asyncHandler");
const genCode = require("../helper/genCode");
const sendConfirmationEmail = require("../helper/sendEmailConfirmation");
const ErrorResponse = require("../helper/ErrorResponse");
const uploadPhoto = require("../middleware/upload");
const path = require("path");
const axios = require("axios");

//@DESC REGISTER A USER
//@ROUTE POST /api/auth/register
//@ACCESS PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email, password } = req.body;

  // VERIFY PASSWORD
  if (!password || !email)
    return next(
      new ErrorResponse({
        status: 400,
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
      new ErrorResponse({ status: 400, message: "Account not found" })
    );

  // VERIFY PASSWORD
  const match = await user.validPassword(password);

  // UNAUTHORIZED IF PASS NOT VALID
  if (!match)
    return next(
      new ErrorResponse({ status: 400, message: "password incorrect" })
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
  // ABOVE IMPLENTATION WORK WITH PRIVATE API
  // TOKEN DESTRUCTION
  // const { idToken } = req.body;
  // // AUTH TO GOOGLE API
  // const client = new OAuth2Client(process.env.GOOGLE_CONSUMER_KEY);
  // // VERIFY TOKEN
  // const ticket = await client.verifyIdToken({ idToken });
  // // VARIABLES DESTRUCTION
  // const { email, picture } = ticket.getPayload();
  // // SEARCH FOR USER IN DB
  // const user = await User.findOne({ email });
  // // IF USER DOESN'T EXIST
  // if (!user) {
  //   // CREATE A DOC
  //   const user = User({
  //     email,
  //     picture,
  //   });
  //   // SAVE DOC
  //   const data = await user.save();
  //   // SEND RESPONSE
  //   if (data) return res.status(201).send({ success: true });
  // }
  // // GENERATE TOKEN
  // await user.generateToken();
  // // SEND RESPONSE
  // res.status(200).send({ success: true, data: user });

  // VARIABLE DESTRUCTION
  const { accessToken } = req.body;

  // VERIFY TOKEN
  if (!accessToken)
    return next(
      new ErrorResponse({ status: 400, message: "Please provide accessToken" })
    );

  // GOOGLE API URL
  const url = `https://www.googleapis.com/oauth2/v1/userinfo`;

  const data = await axios.get(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  // VERIFY RESPONSE STATUS
  if (data.status != 200)
    return next(
      new ErrorResponse({
        status: 400,
        message: "Please provide valid accessToken",
      })
    );
  // VARIABLE DESTRUCTION
  const { email, name, picture } = data.data;

  const user = await User.findOne({ email });
  if (user) {
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
    return res.status(200).send({ success: true, data: data });
  }

  // CREATE NEW USER DOC
  const newUser = new User({
    email,
    username: name,
    picture: picture,
    status: "online",
    isVerified: true,
  });

  // GENERATE MAIL CONF TOKEN
  newUser.token = await newUser.generateToken();

  // SAVE DOC
  await newUser.save();

  // SEND RESPONSE
  res.status(200).send({ success: true, data: newUser });
});

//@DESC REGISTER OR LOGIN A USER BY FACEBOOK OAUTH
//@ROUTE POST /api/auth/facebook
//@ACCESS PUBLIC
exports.facebookAuth = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { accessToken } = req.body;

  // VERIFY TOKEN
  if (!accessToken)
    return next(
      new ErrorResponse({ status: 400, message: "Please provide accessToken" })
    );

  // FACEBOOK URL TO GET USER INFORMATIONS
  const url = `https://graph.facebook.com/me?access_token=${accessToken}&fields=name%2Cemail%2Cpicture`;

  // CALL FB API
  const data = await axios.get(url);

  // VERIFY RESPONSE STATUS
  if (data.status != 200)
    return next(
      new ErrorResponse({
        status: 400,
        message: "Please provide valid accessToken",
      })
    );
  // VARIABLE DESTRUCTION
  const { email, name } = data.data;

  const user = await User.findOne({ email });
  if (user) {
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
    return res.status(200).send({ success: true, data: data });
  }

  // CREATE NEW USER DOC
  const newUser = new User({
    email,
    username: name,
    picture: data.data.picture.data.url,
    status: "online",
    isVerified: true,
  });

  // GENERATE MAIL CONF TOKEN
  newUser.token = await newUser.generateToken();

  // SAVE DOC
  await newUser.save();

  // SEND RESPONSE
  res.status(200).send({ success: true, data: newUser });
});

//@DESC REGISTER OR LOGIN A USER BY GOOGLE OAUTH
//@ROUTE POST /api/profile/edit
//@ACCESS PRIVATE
exports.edit = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email, username, musicPreference } = req.body;
  const { id: userId } = req.user;

  // UPDATE USER DOC
  const data = await User.findOneAndUpdate(
    { _id: userId },
    { email, username, musicPreference },
    { new: true, runValidators: true }
  );

  // ERROR RESPONSE
  if (!data)
    return next(new ErrorResponse({ success: 400, message: "Bad request" }));

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
    return next(new ErrorResponse({ status: 401, message: "Unauthorized" }));

  // VERIFY CONFIRMATION CODE
  if (user.mailConfCode === code) {
    // GENERATE TOKEN
    const token = await user.generateToken();
    // UPDATE DATA
    await user.updateOne({
      $set: {
        isVerified: true,
        mailConfCode: null,
        status: "online",
        mailConfToken: null,
        token
      },
    });

    // GET UPDATED USER DOC
    user = await User.findOne({ _id: userId });

    // SEND RESPONSE
    return res.status(200).send({ success: true, data: user });
  }

  res
    .status(400)
    .send({ success: false, message: "verfication code is invalid" });
});

//@DESC CHANGE PASSWORD FOR USER ALREADY CONNECTED
//@ROUTE PUT /api/profile/password
//@ACCESS PRIVATE
exports.changePass = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { oldPassword, newPassword } = req.body;
  const { id: userId } = req.user;

  // FIND USER DOC
  const user = await User.findOne({ _id: userId });

  // HASH PASS
  const match = await user.validPassword(oldPassword);

  // UNAUTHORIZED IF PASS NOT VALID
  if (!match)
    return next(
      new ErrorResponse({ status: 400, message: "passwords not matched" })
    );

  //  UPDATE PASSWORD
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $set: { password: newPassword } },
    { new: true, runValidators: true }
  );

  // SAVE DOC TO HASH THE PASSWORD;
  const data = await updatedUser.save();

  // IF SAVE FAILED
  if (!data)
    return next(new ErrorResponse({ status: 500, message: "Internal error" }));

  // SEND RESPONSE
  res.status(200).send({ succes: "true", data: data });
});

//@DESC SEND FORGOT CODE PASS TO USER MAIL
//@ROUTE POST /api/password/forgot
//@ACCESS PUBLIC
exports.forgotPasswordCode = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { email } = req.body;

  // SEARCH FOR EMAIL IN DB
  const user = await User.findOne({ email });

  // IF USER DOESN'T EXIST
  if (!user)
    return next(new ErrorResponse({ status: 401, message: "Unauthorized" }));

  // GENERATE RANDOM CONFIRMATION CODE
  const code = genCode();

  // UPDATE FORGOT PASS CODE
  const data = await User.findOneAndUpdate(
    { email },
    { $set: { forgotPassConfCode: code } },
    { new: true }
  );

  // // MAIL MESSAGE
  // const message = {
  //   from: process.env.EMAIL,
  //   to: email,
  //   subject: "Forgot password",
  //   html: `<h1>Forgot Password Confirmation</h1>
  //       <h4>${code}</h4>
  //       </div>`,
  // };

  // // SEND VERIFICATION EMAIL
  // await sendConfirmationEmail(message);

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

//@DESC CHANGE PASSWORD BY FORGOT METHODE
//@ROUTE PUT /api/password/change
//@ACCESS PUBLIC
exports.changeForgotPass = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { code: forgotPassConfCode, password } = req.body;

  //  UPDATE PASSWORD
  const user = await User.findOneAndUpdate(
    { forgotPassConfCode },
    { $set: { password, forgotPassConfCode: null } },
    { new: true, runValidators: true }
  );

  // IF USER DOESN'T EXIST
  if (!user)
    return next(
      new ErrorResponse({
        status: "404",
        message: "Confirmation code not found",
      })
    );

  // SAVE DOC TO HASH THE PASSWORD;
  const data = await user.save();

  // IF SAVE FAILED
  if (!data)
    return next(
      new ErrorResponse({ status: "500", message: "Internal error" })
    );

  // SEND RESPONSE
  res.status(200).send({ success: true, data: data });
});

//@DESC LOGOUT
//@ROUTE POST /api/user/logout
//@ACCESS PRIVATE
exports.logout = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  const { id: userId } = req.user;

  // SEARCH FOR A USER IN DB
  const user = await User.findOne({ _id: userId });

  // UPDATE STATUS AND TOKEN
  const data = await user.updateOne({
    $set: { status: "offline", token: null },
  });

  // SEND RESPONSE
  res.status(200).send({ success: true });
});

//@DESC GET A USER INFORMATION
//@ROUTE get /api/users/:id
//@ACCESS PRIVATE
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

//@DESC SEARCH FOR USER
//@ROUTE GET /api/users/search
//@ACCESS PRIVATE
exports.userSearch = asyncHandler(async (req, res, next) => {
  // VARIABLE DESTRUCTION
  let { page = 1, limit = 10, username = "" } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const data = await User.find({
    username: { $regex: username },
  })
    .limit(limit)
    .skip((page - 1) * 10);

  res.status(200).send({ succes: true, data });
});
