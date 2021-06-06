const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

const userSchema = mongoose.Schema({
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
  picture: { type: String },
  isVerified: { type: Boolean, default: false },
  forgotPass: { code: Number, exp: Date },
  mailVer: { code: Number, exp: Date },
  token: { type: String, unique: true },
});

// HASH PASSWORD
userSchema.pre("save", async function (next) {
  if (this.password)
    this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

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
  console.log("holla");
  const match = await bcrypt.compare(password, this.password);

  return match;
};

module.exports = mongoose.model("User", userSchema);
