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

describe("Test getting user information (/api/users/:id)", () => {
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

  it("authorized request", async () => {
    const response = await request(app)
      .get(`/api/users/${user_two._id}`)
      .set({ Authorization: `Bearer ${user_one.token}` });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).not.toEqual([]);
  });

  it("not authorized request", async () => {
    let newToken = "";
    for (let c of user_one.token) {
      newToken += user_one.token.charAt(
        Math.floor(Math.random() * user_one.token.length)
      );
    }
    const response = await request(app)
      .get("/api/me")
      .set({ Authorization: `Bearer ${newToken}` });

    expect(response.status).toBe(401);
  });
});
