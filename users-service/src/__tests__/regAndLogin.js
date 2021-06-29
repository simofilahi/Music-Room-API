const request = require("supertest");
const app = require("../index");

jest.setTimeout(50000);

const RegAndLogin = () => {
  let mailConfCode = "";
  let mailConfToken = "Bearer ";
  let token = "Bearer ";

  it("given correct email and password for registration", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@test.com",
      password: "12*@Atbnmv",
    });
    expect(response.status).toBe(201);
    mailConfCode = response.body.data.mailConfCode;
    mailConfToken = response.body.data.mailConfToken;
  });

  it("verify an account", async () => {
    const response = await request(app)
      .post("/api/email/confirm")
      .send({
        code: mailConfCode,
      })
      .set({ Authorization: mailConfToken });
    expect(response.status).toBe(200);
    expect(response.body.data.isVerified).toBe(true);
  });

  it("given email password for login", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "12*@Atbnmv",
    });
    console.log(response);
    expect(response.status).toBe(200);
    expect(response.body.data.isVerified).toBe(true);
    token = response.body.data.token;
  });
  return token;
};

module.exports = RegAndLogin;
