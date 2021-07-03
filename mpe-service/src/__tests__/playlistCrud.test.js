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

describe("Playlist CRUD", () => {
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

  it("given correct data to create a playlist", async () => {
    const response = await request(app)
      .post(`/api/playlists`)
      .send({
        name: "ZHO",
        desc: "",
        musicPreference: ["Pop", "Jaz"],
        visbility: "private",
      })
      .set({ Authorization: `Bearer ${user_one.token}` });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).not.toEqual([]);
  });
});
