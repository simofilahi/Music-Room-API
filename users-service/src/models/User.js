const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

// USER SCHEMA
const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      minLength: [4, "Username must be greather than 8 char"],
      maxLength: [16, "Username must be smaller than 24 char"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      match: [
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        "email not valid",
      ],
    },
    password: {
      type: String,
      minLength: [8, "Password must be greather than 8 char"],
      maxLength: [24, "Password must be smaller than 24 char"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password not valid",
      ],
    },
    musicPreference: [],
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    visibility: {
      type: String,
      enum: ["Public", "Private", "OnlyFriends"],
      default: "Public",
    },
    picture: { type: String },
    isVerified: { type: Boolean, default: false },
    forgotPassConfCode: { type: Number },
    // confirmationCode: { code: Number, exp: Date },
    mailConfCode: { type: Number },
    mailConfToken: { type: String },
    token: { type: String },
  },
  { timestamps: true }
);

// HASH PASSWORD
userSchema.pre("save", async function () {
  if (this.password)
    this.password = await bcrypt.hash(this.password, saltRounds);
});

// GENERATE JWT TOKEN
userSchema.methods.generateToken = async function () {
  const token = await jwt.sign(
    { email: this.email, _id: this._id },
    process.env.SECRET,
    { expiresIn: "7d" }
  );
  return token;
};

// GENERATE CONFIRMATION TOKEN
userSchema.methods.generateMailConfToken = async function () {
  const mailConfToken = await jwt.sign(
    { email: this.email, _id: this._id },
    process.env.SECRET,
    { expiresIn: "7d" }
  );
  return mailConfToken;
};

// CHECK INCOMING PASSWORD IS MATCHED WITH THE PASSWORD IN DB
userSchema.methods.validPassword = async function (password) {
  const match = await bcrypt.compare(password, this.password);

  return match;
};

module.exports = mongoose.model("User", userSchema);
