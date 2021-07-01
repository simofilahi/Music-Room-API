const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const dotenv = require("dotenv");
const regAndLogin = require("../__mocks__/regAndLogin");
const shuffleToken = require("../__mocks__/shuffleToken");

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// DB URI
const DB_URI = process.env.DB_URI;

jest.setTimeout(50000);

describe("Change password by forgot password methode", () => {
  let token = "";
  let forgotPassConfCode = "";

  beforeAll(async () => {
    await mongoose.connect(DB_URI);
    const data = await regAndLogin("example@example.com", "A*a123456");
    token = data.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropCollection("users");
  });

  it("given incorrect mail to get forgot password code", async () => {
    const response = await request(app).post("/api/password/forgot").send({
      email: "example10@example.com",
    });

    expect(response.status).toBe(401);
  });

  it("given correct mail to get forgot password code", async () => {
    const response = await request(app).post("/api/password/forgot").send({
      email: "example@example.com",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).not.toEqual([]);
    forgotPassConfCode = response.body.data.forgotPassConfCode;
  });

  it("given incorrect forgot password code", async () => {
    const response = await request(app).put("/api/password/change").send({
      code: 458719,
      password: "12*A@tbnmvyyy",
    });

    expect(response.status).toBe(404);
  });

  it("given incorrect password", async () => {
    const response = await request(app).put("/api/password/change").send({
      code: forgotPassConfCode,
      password: "12tbnmvyyy",
    });

    expect(response.status).toBe(400);
  });

  it("given correct forgot password code and password", async () => {
    const response = await request(app).put("/api/password/change").send({
      code: forgotPassConfCode,
      password: "12*A@tbnmvyyy",
    });

    expect(response.status).toBe(200);
  });
});
