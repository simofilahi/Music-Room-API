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

describe("Change password", () => {
  let token = "";

  beforeAll(async () => {
    await mongoose.connect(DB_URI);
    const data = await regAndLogin("test@test.com", "A*a123456");
    token = data.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropCollection("users");
  });

  it("given correct newPassword", async () => {
    const response = await request(app)
      .put("/api/profile/password")
      .send({
        oldPassword: "A*a123456",
        newPassword: "12*A@tbnmvyyytt",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).not.toEqual([]);
  });

  it("given incorrect oldpassword", async () => {
    const response = await request(app)
      .put("/api/profile/password")
      .send({
        oldPassword: "A*a1234567",
        newPassword: "12*A@tbnmvyyytt",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it("given incorrect newPassword", async () => {
    const response = await request(app)
      .put("/api/profile/password")
      .send({
        oldPassword: "A*a123456",
        newPassword: "12tbnmvyyytt",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it("given incorrect token", async () => {
    const incorrectToken = shuffleToken(token);

    const response = await request(app)
      .put("/api/profile/password")
      .send({
        oldPassword: "A*a123456",
        newPassword: "12*A@tbnmvyyytt",
      })
      .set({ Authorization: `Bearer ${incorrectToken}` });

    expect(response.status).toBe(401);
  });
});
