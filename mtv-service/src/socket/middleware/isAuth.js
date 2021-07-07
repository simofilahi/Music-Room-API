const axios = require("axios");

const isAuth = async (socket, next) => {
  const config = {
    headers: {
      authorization: socket.handshake.query.token,
    },
  };
  // HTTP CALL TO VERIFY AUTH
  try {
    const data = await axios.get(
      `${process.env.EVENT_BUS_SERVICE}/api/auth`,
      config
    );
    // VERIFY RESPONSE
    if (data.data.success) {
      socket.client.isAuth = true;
      return next();
    }
  } catch {}

  // IF THE USER DOESN'T AUTHENICATED
  socket.client.isAuth = false;
  return next();
};

module.exports = isAuth;
