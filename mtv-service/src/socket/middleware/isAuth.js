const axios = require("axios");

const isAuth = async (socket, next) => {
  console.log("HEY HERE");
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
      socket.client.id = data.data.data._id;
      return next();
    }
  } catch {
    socket.client.isAuth = false;
    return next();
  }

  // IF THE USER DOESN'T AUTHENICATED
  socket.client.isAuth = false;
  return next();
};

module.exports = isAuth;
