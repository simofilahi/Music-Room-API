const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const dotenv = require("dotenv");
const regAndLogin = require("../__mocks__/regAndLogin");

// LOAD ENV VARS
dotenv.config({ path: ".env" });

// DB URI
const DB_URI = process.env.DB_URI;

jest.setTimeout(50000);

describe("Test getting profile informations (/api/me)", () => {
  let token = "";

  beforeAll(async () => {
    await mongoose.connect(DB_URI);
    const data = await regAndLogin("test@test.com", "A*a123456");
    token = data.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropCollection("users");
  });

  it("get logged user information", async () => {
    const response = await request(app)
      .get("/api/me")
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).not.toEqual([]);
    expect(response.body.data.isVerified).toBe(true);
  });

  it("inccorect token", async () => {
    // SHUFFLE TOKEN
    let newToken = "";
    for (let c of token) {
      newToken += token.charAt(Math.floor(Math.random() * token.length));
    }
    const response = await request(app)
      .get("/api/me")
      .set({ Authorization: `Bearer ${newToken}` });

    expect(response.status).toBe(401);
  });
});
