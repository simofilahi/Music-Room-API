const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const dotenv = require("dotenv");
const regAndLogin = require("./regAndLogin");

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// DB URI
const DB_URI = process.env.DB_URI;

jest.setTimeout(50000);

describe("Test me route (/api/me)", () => {
  let token = "";
  beforeAll(async () => {
    await mongoose.connect(DB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropCollection("users");
  });

  it("register and login a user", async () => {
    token = regAndLogin();
    expect(token).toBe(token.length > 10);
  });

  it("get logged user information", async () => {
    console.log(token);
    const response = await request(app)
      .get("/api/me")
      .set({ Authorization: token });
    expect(response.status).toBe(200);
    expect(response.body.data.isVerified).toBe(true);
  });
});
