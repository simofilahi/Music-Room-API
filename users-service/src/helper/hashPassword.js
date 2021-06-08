const bcrypt = require("bcrypt");
const saltRounds = 10;

// HASH PASSWORD
const hashPassword = async (plainPassword) =>
  (this.password = await bcrypt.hash(plainPassword, saltRounds));

module.exports = hashPassword;
