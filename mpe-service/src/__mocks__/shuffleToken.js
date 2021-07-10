const shuffleToken = (token) => {
  // SHUFFLE TOKEN
  let newToken = "";
  for (let c of token) {
    newToken += token.charAt(Math.floor(Math.random() * token.length));
  }

  return newToken;
};

module.exports = shuffleToken;
