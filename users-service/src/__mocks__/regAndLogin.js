const request = require("supertest");
const app = require("../index");

const RegAndLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    let mailConfCode = "";
    let mailConfToken = "Bearer ";

    let response = [];
    response = await request(app).post("/api/auth/register").send({
      email: email,
      password: password,
    });

    if (!response.status == 201) reject(null);
    mailConfCode = response.body.data.mailConfCode;
    mailConfToken += response.body.data.mailConfToken;
    response = await request(app)
      .post("/api/email/confirm")
      .send({
        code: mailConfCode,
      })
      .set({ Authorization: mailConfToken });

    if (!response.status == 200 || !response.body.data.isVerified) reject(null);

    response = await request(app).post("/api/auth/login").send({
      email: email,
      password: password,
    });

    if (!response.status == 200 || !response.body.data.isVerified) reject(null);
    resolve(response.body.data);
  });
};

module.exports = RegAndLogin;
