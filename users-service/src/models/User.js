const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// USER SCHEMA
const userSchema = mongoose.Schema(
  {
    username: { type: String },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      match:
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password: {
      type: String,
      min: [8, "Password must be greather than 8 char"],
      max: [24, "Password must be smaller than 24 char"],
    },
    visibility: {
      type: String,
      enum: ["Public", "Private", "OnlyFriends"],
      default: "Public",
    },
    picture: { type: String },
    isVerified: { type: Boolean, default: false },
    forgotPass: { code: Number, exp: Date },
    // confirmationCode: { code: Number, exp: Date },
    confirmationCode: { type: Number },
    token: { type: String, unique: true },
  },
  { timestamps: true }
);

// GENERATE JWT TOKEN
userSchema.methods.generateToken = async function () {
  this.token = await jwt.sign(
    { email: this.email, _id: this._id },
    process.env.SECRET,
    { expiresIn: "7d" }
  );
};

// CHECK INCOMING PASSWORD IS MATCHED WITH THE PASSWORD IN DB
userSchema.methods.validPassword = async function (password) {
  const match = await bcrypt.compare(password, this.password);

  return match;
};

module.exports = mongoose.model("User", userSchema);
