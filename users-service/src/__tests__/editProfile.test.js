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

describe("Edit profile", () => {
  let user_one = [];
  let user_two = [];

  beforeAll(async () => {
    await mongoose.connect(DB_URI);
    user_one = await regAndLogin("test@test.com", "A*a123456");
    user_two = await regAndLogin("exmaple@exmaple.com", "A*a123456");
  });

  afterAll(async () => {
    await mongoose.connection.db.dropCollection("users");
  });

  it("given correct data", async () => {
    const response = await request(app)
      .put("/api/profile/edit")
      .send({
        email: "test100@test.com",
        username: "simo",
        musicPreference: ["pop", "jaz"],
      })
      .set({ Authorization: `Bearer ${user_one.token}` });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).not.toEqual([]);
  });

  it("given incorrect email format", async () => {
    const response = await request(app)
      .put("/api/profile/edit")
      .send({
        email: "test100@testcom",
        username: "simo",
        musicPreference: ["pop", "jaz"],
      })
      .set({ Authorization: `Bearer ${user_one.token}` });

    expect(response.status).toBe(400);
  });

  it("given empty email", async () => {
    const response = await request(app)
      .put("/api/profile/edit")
      .send({
        email: "",
        username: "simo",
        musicPreference: ["pop", "jaz"],
      })
      .set({ Authorization: `Bearer ${user_one.token}` });

    expect(response.status).toBe(400);
  });

  it("given empty username", async () => {
    const response = await request(app)
      .put("/api/profile/edit")
      .send({
        email: "test100@test.com",
        username: "",
        musicPreference: ["pop", "jaz"],
      })
      .set({ Authorization: `Bearer ${user_one.token}` });

    expect(response.status).toBe(400);
  });

  it("given incorrect username length", async () => {
    const response = await request(app)
      .put("/api/profile/edit")
      .send({
        email: "test100@test.com",
        username: "si",
        musicPreference: ["pop", "jaz"],
      })
      .set({ Authorization: `Bearer ${user_one.token}` });

    expect(response.status).toBe(400);
  });
});
