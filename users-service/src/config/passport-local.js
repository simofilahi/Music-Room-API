const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const options = {
  usernameField: "email",
};

const strategy = new LocalStrategy(async (email, password, done) => {
  const user = await User.find({ email });

  if (!user) return done(null, false, { message: "Incorrect email" });
  else if (!user.validPassword(password))
    return done(null, false, { message: "Incorrect password" });
  return done(null, user);
});

module.exports = passport.use(options, strategy);
